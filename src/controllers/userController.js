require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { generateRandomId, generateRandomEmail, generateUID } = require('../helpers/helpers');
const axios = require('axios');
const FirebaseUserModel = require('../models/FirebaseUserModel');
const SignUpEmailModel = require('../models/SignUpModel/SignUpEmailModel');

// Models imports
const SignUpUserModel = require('../models/SignUpModel/SignUpUsermodel');

const UserController = {
    // Get all data from the database
    async getAllData(req, res, next) {
        try {
            const collections = await db.listCollections();
            const allData = {};
            for await (const collection of collections) {
                const collectionData = await collection.get();
                const docs = [];
                collectionData.forEach(doc => {
                    const docId = doc.id;
                    const docData = doc.data();
                    const dataWithId = { ...docData, id: docId };
                    docs.push(dataWithId);
                });
                allData[collection.id] = docs;
            }
            res.status(200).json(allData);
        } catch (error) {
            next(error);
        }
    },

    // EXPERIMENTAL Massive insert of emails
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
     * Registers a new user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Promise<void>} - A promise that resolves when the user is registered.
     * @throws {Error} - If there is an error during the registration process.
     */
    async registerUser(req, res, next) {
        try {
            const firebaseUID = req.body.uid;
            const userData = req.body;
            if (!firebaseUID) {
                return res.status(400).json({ error: "Firebase UID is required." });
            }

            const filteredUserData = {};
            Object.keys(userData).forEach(key => {
                if (Object.keys(SignUpUserModel.schema.paths).includes(key)) {
                    filteredUserData[key] = userData[key];
                }
            });
            filteredUserData.registrationDate = new Date();
            const newUser = new SignUpUserModel(filteredUserData);
            const validationError = newUser.validateSync();
            if (validationError) {
                return res.status(400).json({ error: "Validation failed. Please check the input data.", details: validationError.errors });
            }

            if (!filteredUserData.hasOwnProperty('generatedByApi') || filteredUserData.generatedByApi !== true) {
                filteredUserData.generatedByApi = true;
            }

            await db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(firebaseUID).set(filteredUserData, { merge: true });
            res.status(200).json({ message: "User registration successfully." });
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

    // Refresh token function for the user
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.body.refreshToken;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token is required' });
            }
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ message: 'Invalid token to refresh' });
                }
                UserModel.findOne({ email: decoded.email }, (err, user) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error finding user' });
                    }
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    const accessToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
                    res.status(200).json({ accessToken });
                });
            });
        } catch (error) {
            next(error);
        }
    },

    // Generate a new token
    async generateToken(req, res, next) {
        try {
            const subscriptionKey = req.headers['ocp-apim-subscription-key'];
            const expectedKey = process.env.OCMP_SUBSCRIPTION_KEY;
            if (subscriptionKey !== expectedKey) {
                return res.status(403).json({ error: 'Invalid subscription key' });
            }
            const user = { id: process.env.USER_ID, username: process.env.USERNAME };
            const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' });
            return res.json({
                Authorization: `Bearer ${token}`
            });
        } catch (error) {
            next(error);
        }
    },

    // Verify token function
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

    // EXPERIMENTAL FUNCTION
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

    // Delete only the uid from the database
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

    // PATCH data using the userModel and the uid from the request body
    async patchData(req, res, next) {
        try {
            const { uid } = req.body;
            const { name, phone, email, pushTokenAPN, platform, ssn, state } = req.body;
            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const mobileUserCollectionRef = db.collection(collectionName);
            await mobileUserCollectionRef.doc(uid).update({
                name,
                phone,
                email,
                pushTokenAPN,
                platform,
                ssn,
                state
            });
            res.status(200).json({ message: 'Successfully updated data' });
        } catch (error) {
            next(error);
        }
    },

    // Health check function
    async health(req, res, next) {
        res.status(200).json({ message: 'Health check OK' });
    },

    // Get user data
    async getUserData(req, res, next) {
        try {
            const { uid } = req.body;

            if (!uid) {
                return res.status(400).json({ message: 'UID is required', data: [] });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format', data: [] });
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
                console.error('Error retrieving user data:', error);
                return res.status(500).json({ message: 'Error retrieving user data', data: [] });
            }

            if (!userData) {
                return res.status(500).json({ message: 'Error processing user data', data: [] });
            }

            res.status(200).json({ data: [userData] });
        } catch (error) {
            console.error('Unexpected error:', error);
            res.status(500).json({ message: 'Unexpected error', data: [] });
            next(error);
        }
    },

    // Warning: This function will delete all users from the database
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