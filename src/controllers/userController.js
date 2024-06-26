require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const { generateRandomId, generateRandomEmail, generateUID } = require('../helpers/helpers');
const axios = require('axios');
const FirebaseUserModel = require('../models/FirebaseUserModel');
const SignUpEmailModel = require('../models/SignUpModel/SignUpEmailModel');

// Models imports
const SignUpUserModel = require('../models/SignUpModel/SignUpUsermodel');

const UserController = {

    /**
     * Retrieves all data from collections and returns it as a JSON response.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the data is retrieved and the response is sent.
     */
    async getAllData(req, res, next) {
        try {
            const collectionsSnapshot = await db.listCollections();
            const allData = {};
    
            for (const collectionRef of collectionsSnapshot) {
                const collectionName = collectionRef.id;
                const docsSnapshot = await collectionRef.get();
                const docs = [];
    
                docsSnapshot.forEach(doc => {
                    const docData = doc.data();
                    const docWithId = { ...docData, id: doc.id };
                    docs.push(docWithId);
                });
    
                allData[collectionName] = docs;
            }
    
            res.status(200).json(allData);
        } catch (error) {
            next(error);
        }
    },    

    /**
     * Inserts random emails into the 'emails' collection in the database.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the emails are successfully inserted.
     */
    async insertEmails(res, next) {
        try {
            const batch = db.batch();
            const emailCollectionRef = db.collection('emails');
            for (let i = 0; i < 100; i++) {
                const randomId = generateRandomId();
                const randomEmail = generateRandomEmail();
                const docRef = emailCollectionRef.doc(randomId);
                batch.set(docRef, {
                    verified: true,
                    email: randomEmail
                });
            }
            await batch.commit();
            res.status(200).json({ message: 'Successfully inserted data' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Registers data of a new user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the user is registered.
     * @throws {Error} - If there is an error during the registration process.
     */
    async registerUser(req, res, next) {
        try {
            const uid = req.body.uid;
            const userData = req.body;
    
            if (!uid) {
                return res.status(400).json({ error: "Firebase UID is required." });
            }
    
            const userRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const userDoc = await userRef.get();
            const filteredUserData = { ...userData };
            if (!filteredUserData.registrationDate) {
                filteredUserData.registrationDate = new Date();
            }

            if (typeof filteredUserData.generatedByApi !== 'boolean') {
                filteredUserData.generatedByApi = true;
            }
    
            const newUser = new SignUpUserModel(filteredUserData);
            const validationError = newUser.validateSync();
            if (validationError) {
                return res.status(400).json({ error: "Validation failed. Please check the input data.", details: validationError.errors });
            }

            if (userDoc.exists) {
                await userRef.set(filteredUserData, { merge: true });
                return res.status(200).json({ message: "User data updated successfully." });
            } else {
                await userRef.set(filteredUserData);
                return res.status(200).json({ message: "User registered successfully." });
            }
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ error: "Validation failed. Please check the input data.", details: error.errors });
            }
    
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Internal Server Error';
            res.status(statusCode).json({ error: errorMessage });
            next(error);
        }
    },     

    /**
     * Updates a user's data.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the user data is updated.
     * @throws {Error} - If there is an error updating the user data.
     */
    async updateUser(req, res, next) {
        try {
            const { uid, userData } = req.body;
            if (userData && Object.keys(userData).length > 0) {
                const newUser = new FirebaseUserModel(userData);
                const validationError = newUser.validateSync();

                if (validationError) {
                    const errorMessage = validationError.message || 'Invalid user data';
                    throw new Error(errorMessage);
                }
            }
            await db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).update(userData);
            res.status(200).json({ message: 'User data updated successfully' });
        } catch (error) {
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Internal Server Error';
            res.status(statusCode).json({ error: errorMessage });
            next(error);
        }
    },

    /**
     * Records an email in the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the email record is added successfully.
     * @throws {Error} - If there is an error adding the email record.
     */
    async recordEmail(req, res, next) {
        try {
            const { email, uid } = req.body;

            if (!email || !uid) {
                return res.status(400).json({ message: 'Email and UID are required in the request body' });
            }

            const newSignUpEmail = new SignUpEmailModel({ email, uid });
            const validationError = newSignUpEmail.validateSync();
            if (validationError) {
                return res.status(400).json({ message: 'Validation error', errors: validationError.errors });
            }

            const emailRecord = {
                email: newSignUpEmail.email,
                verified: false,
                uid: newSignUpEmail.uid,
                registrationDateAndTime: new Date(),
                generatedByApi: true
            };

            const emailCollectionRef = db.collection(process.env.EMAILSCOLLECTION);
            const docRef = emailCollectionRef.doc(uid);
            await docRef.set(emailRecord);
            res.status(200).json({ message: 'Email record added successfully.' });
        } catch (error) {
            res.status(400).json({ message: 'Error adding email record.' });
            next(error);
        }
    },

    /**
     * Updates the email verification status for a user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the email verification is updated.
     * @throws {Error} - If an error occurs while updating the email verification status.
     */
    async patchEmailVerification(req, res, next) {
        try {
            const { uid, email } = req.body;

            if (!uid || !email) {
                return res.status(400).json({ message: 'Both UID and Email are required in the request body' });
            }

            const emailCollectionRef = db.collection(process.env.EMAILSCOLLECTION);
            const querySnapshot = await emailCollectionRef.where('uid', '==', uid).where('email', '==', email).get();

            if (querySnapshot.empty) {
                return res.status(404).json({ message: 'Email not found or UID does not match' });
            }

            const docRef = querySnapshot.docs[0].ref;
            const isVerified = querySnapshot.docs[0].data().verified;

            if (isVerified) {
                return res.status(200).json({ message: 'Email already verified' });
            } else {
                await docRef.update({ verified: true });
                return res.status(200).json({ message: 'Email verified successfully' });
            }
        } catch (error) {
            next(error);
        }
    },

    /**
     * Generates a token for authentication.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Object} The generated token.
     * @throws {Error} If an error occurs during token generation.
     */
    async generateToken(req, res, next) {
        try {
            const subscriptionKey = req.headers['ocp-apim-subscription-key'];
            if (!subscriptionKey) {
                return res.status(400).json({ error: 'Subscription key is missing' });
            }
    
            const expectedKey = process.env.OCMP_SUBSCRIPTION_KEY;
            if (!expectedKey) {
                throw new Error('Subscription key is not configured in the environment');
            }
    
            if (subscriptionKey !== expectedKey) {
                return res.status(403).json({ error: 'Invalid subscription key' });
            }

            const userId = process.env.USER_ID;
            const username = process.env.USERNAME;
            const secretKey = process.env.SECRET_KEY;
            
            if (!userId || !username || !secretKey) {
                throw new Error('Required environment variables (USER_ID, USERNAME, SECRET_KEY) are not defined');
            }
    
            const user = { id: userId, username: username };
            const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
            return res.json({
                Authorization: `Bearer ${token}`
            });
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(500).json({ error: 'Error generating token' });
            }
            next(error);
        }
    },

    /**
     * Verifies the token provided in the request.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the token is verified.
     */
    async verifyToken(req, res, next) {
        try {
            const subscriptionKey = req.headers['ocp-apim-subscription-key'];
            const expectedKey = process.env.OCMP_SUBSCRIPTION_KEY;
            if (subscriptionKey !== expectedKey) {
                return res.status(403).json({ error: 'Invalid subscription key' });
            }
            const token = req.body.token;
            if (!token) {
                return res.status(401).json({ error: 'Token not provided' });
            }
            const BearerToken = token.split(' ')[1];
            jwt.verify(BearerToken, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    return res.status(403).json({ error: 'Invalid token' });
                }
                return res.status(200).json({ message: 'Token is valid' });
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Sends multiple requests to a specified URL using axios.
     * @async
     * @function sendRequests
     * @returns {Promise<void>} A promise that resolves when all requests are completed.
     */
    async sendRequests() {
        const requests = [];
        const numRequests = 201;
        const url = 'http://localhost:3000/api/newToken';
        for (let i = 0; i < numRequests; i++) {
            requests.push(axios.post(url, {}));
        }

        try {
            const responses = await Promise.all(requests);
            console.log('All requests were successful');
        } catch (error) {
            if (error.response) {
                console.error('Error on request: ', error.response.status, error.response.statusText);
            } else if (error.request) {
                console.error('Error! Any response of the server: ', error.request);
            } else {
                console.error('Error on sending request: ', error.message);
            }
        }
    },

    /**
     * Deletes a user by UID.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the user is deleted.
     * @throws {Error} - If an error occurs while deleting the user.
     */
    async deleteUid(req, res, next) {
        try {
            const { uid } = req.body;
            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const mobileUserCollectionRef = db.collection(collectionName);
            const docRef = mobileUserCollectionRef.doc(uid);
            const doc = await docRef.get();
            if (!doc.exists) {
                return res.status(400).json({ message: 'UID does not exist' });
            }
            await docRef.delete();
            res.status(200).json({ message: 'Successfully deleted uid' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Updates user data in the database based on the provided UID and specific fields.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the data is successfully updated.
     * @throws {Error} - If an error occurs while updating the data.
     */
    async patchData(req, res, next) {
        try {
            const { uid, ...updateFields } = req.body;
            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const mobileUserCollectionRef = db.collection(collectionName);

            Object.keys(updateFields).forEach(key => {
                if (updateFields[key] === undefined) {
                    delete updateFields[key];
                }
            });
    
            await mobileUserCollectionRef.doc(uid).update(updateFields);
            res.status(200).json({ message: 'Successfully updated data' });
        } catch (error) {
            next(error);
        }
    },   

    /**
     * Handles the health check endpoint.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
    async health(req, res, next) {
        res.status(200).json({ message: 'Health check OK' });
    },

    /**
     * Retrieves user data based on the provided UID.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the user data is retrieved.
     */
    async sendMEData(req, res, next) {
        try {
            const { uid } = req.body;
            if (!uid) {
                return res.status(400).json({ message: 'UID is required', data: [] });
            }
            
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format', data: [] });
            }

            const keys = Object.keys(req.body);
            if (keys.length !== 1 || keys[0] !== 'uid') {
                return res.status(400).json({ message: 'Only one UID is allowed in the request body', data: [] });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            let userData;
            try {
                const doc = await mobileUserDocRef.get();
                if (!doc.exists) {
                    return res.status(404).json({ message: 'User not found', data: [] });
                }
                userData = doc.data();
            } catch (error) {
                return res.status(500).json({ message: 'Error retrieving user data', data: [] });
            }
    
            if (!userData) {
                return res.status(500).json({ message: 'Error processing user data', data: [] });
            }
    
            // Deleting some data on response for security reasons
            delete userData.password;
            delete userData.pushTokenAPN;
            delete userData.will;
            delete userData.insurancePolicy;
            delete userData.generatedByApi;
            
            res.status(200).json({ data: [userData] });
        } catch (error) {
            res.status(500).json({ message: 'Unexpected error', data: [] });
            next(error);
        }
    },  

    // Warning: This function will delete all users from the database
    /**
     * Deletes all users from the specified collection.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Object} The response object.
     */
    async deleteAllUsers(req, res, next) {
        try {
            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;

            if (!collectionName) {
                return res.status(500).json({ message: 'Collection name not specified in environment variables', data: [] });
            }

            const collectionRef = db.collection(collectionName);
            const batchDelete = async () => {
                try {
                    const snapshot = await collectionRef.get();
                    const batch = db.batch();
                    snapshot.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                } catch (error) {
                    console.error('Error deleting documents:', error);
                    throw error;
                }
            };

            await batchDelete();
            return res.status(200).json({ message: 'All users deleted successfully' });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ message: 'Unexpected error', data: [] });
        }
    }
};

module.exports = UserController;