require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { generateRandomId, generateRandomEmail, generateUID } = require('../helpers/helpers');
const axios = require('axios');

const UserController = {
    // Get all data from the database
    async getData(req, res, next) {
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

    // Register a new user
    async registerUser (req, res, next) {
        try {
            const { name, phone, email, password, pin, pushTokenAPN, platform } = req.body;
            const uid = generateUID(20);
            const mobileUserCollectionRef = db.collection('mobile_user');
            const registrationDateAndTime = new Date();
            await mobileUserCollectionRef.doc(uid).set({
                name,
                phone,
                email,
                password,
                pin,
                pushTokenAPN,
                platform,
                registrationDateAndTime,
                generatedByApi: true
            });
            res.status(200).json({ uid });
        } catch (error) {
            next(error);
        }
    },

    // Record email
    async recordEmail(req, res, next) {
        try {
            const { email, uid } = req.body;
            if (!email || !uid) {
                return res.status(400).json({ message: 'Email and UID are required in the request body' });
            }
    
            const emailCollectionRef = db.collection('emails');
            const docRef = emailCollectionRef.doc(uid);
            const registrationDateAndTime = new Date();
    
            await docRef.set({
                email,
                verified: false,
                uid,
                registrationDateAndTime,
                generatedByApi: true
            });
            res.status(200).json({ message: 'Email record added successfully.' });
        } catch (error) {
            res.status(400).json({ message: 'Error adding email record.' });
            throw error;
        }
    },    

    // Patch email verification
    async patchEmailVerification(req, res, next) {
        try {
            const { uid, email } = req.body;
    
            if (!uid || !email) {
                return res.status(400).json({ message: 'Both UID and Email are required in the request body' });
            }
    
            const emailCollectionRef = db.collection('emails');
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
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString();
            return res.json({ 
                Authorization: `Bearer ${token}`,
                generatedAt: formattedDate
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
            const mobileUserCollectionRef = db.collection('mobile_user');
            await mobileUserCollectionRef.doc(uid).delete();
            res.status(200).json({ message: 'Successfully deleted uid' });
        } catch (error) {
            next(error);
        }
    },

    // PATCH data using the userModel and the uid from the request body
    async patchData(req, res, next) {
        try {
            const { uid } = req.body;
            const { name, phone, email, password, pin, pushTokenAPN, platform } = req.body;
            const mobileUserCollectionRef = db.collection('mobile_user');
            await mobileUserCollectionRef.doc(uid).update({
                name,
                phone,
                email,
                password,
                pin,
                pushTokenAPN,
                platform
            });
            res.status(200).json({ message: 'Successfully updated data' });
        } catch (error) {
            next(error);
        }
    },

    // Health check function
    async health(req, res, next) {
        res.status(200).json({ message: 'Health check OK' });
    }
};

module.exports = UserController;
