require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { BlockedIP } = require('../models/BlockedIP');

const UtilsServerController = {
    // Get and search for a specific email in multiple collections
    async getAndSearchSpecificEmailFromEmails(req, res, next) {
        try {
            const { email, collections } = req.body;
            if (!email || !collections || !Array.isArray(collections) || collections.length === 0) {
                return res.status(400).json({ message: "Email and collections array are required and must not be empty" });
            } else if (typeof email !== 'string' || !collections.every(collection => typeof collection === 'string')) {
                return res.status(400).json({ message: "Email must be a string and collections must be an array of strings" });
            }
            const results = [];
            for (const collectionName of collections) {
                const collectionRef = db.collection(collectionName);
                const collectionSnapshot = await collectionRef.get();
                if (!collectionSnapshot.empty) {
                    const query = collectionRef.where('email', '==', email);
                    const querySnapshot = await query.get();
                    querySnapshot.forEach(doc => {
                        const docId = doc.id;
                        const docData = doc.data();
                        const dataWithId = { ...docData, id: docId, collection: collectionName };
                        results.push(dataWithId);
                    });
                }
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Email not found in any collection" });
            }
            const separatedResults = {};
            results.forEach(result => {
                if (!separatedResults[result.collection]) {
                    separatedResults[result.collection] = [];
                }
                separatedResults[result.collection].push(result);
            });

            res.status(200).json({ message: "Email exists", separatedResults });
        } catch (error) {
            res.status(400).json({ message: "Error on request: ", error });
            throw error;
        }
    },

    // Search phone number in mobile_user collection
    async getAndSearchSpecificPhoneFromUsers(req, res, next) {
        try {
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ message: "Phone is required" });
            } else if (typeof phone !== 'string') {
                return res.status(400).json({ message: "Phone must be a string" });
            }
            const collectionName = process.env.COLLECTIONNAME;
            const mobileUserCollectionRef = db.collection(collectionName);
            const query = mobileUserCollectionRef.where('phone', '==', phone);
            const querySnapshot = await query.get();
            if (querySnapshot.empty) {
                return res.status(404).json({ message: "Phone not found" });
            }
            const results = [];
            querySnapshot.forEach(doc => {
                const docId = doc.id;
                const docData = doc.data();
                const dataWithId = { ...docData, id: docId };
                results.push(dataWithId);
            });
            res.status(200).json({ message: "Phone exists", results });
        } catch (error) {
            res.status(400).json({ message: "Error on request: ", error });
            throw error;
        }
    },

    // Get and search specific name in mobile_user collection
    async getAndSearchSpecificNameFromMobileUser(req, res, next) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: "Name is required" });
            } else if (typeof name !== 'string') {
                return res.status(400).json({ message: "Name must be a string" });
            }
            const collectionName = process.env.COLLECTIONNAME;
            const mobileUserCollectionRef = db.collection(collectionName);
            const query = mobileUserCollectionRef.where('name', '==', name);
            const querySnapshot = await query.get();
            if (querySnapshot.empty) {
                return res.status(404).json({ message: "Name not found" });
            }
            const results = [];
            querySnapshot.forEach(doc => {
                const docId = doc.id;
                const docData = doc.data();
                const dataWithId = { ...docData, id: docId };
                results.push(dataWithId);
            });
            res.status(200).json({ message: "Name exists", results });
        } catch (error) {
            res.status(400).json({ message: "Error on request: ", error });
            throw error;
        }
    },

    // Search user using their data
    async searchUser(req, res, next) {
        try {
            const { email, phone, name, collections } = req.body;
            if (!email && !phone && !name) {
                return res.status(400).json({ message: "At least one of email, phone, or name is required" });
            }
            if (!collections || !Array.isArray(collections) || collections.length === 0) {
                return res.status(400).json({ message: "Collections array is required and must not be empty" });
            }
            let queryField, queryValue;
            if (email) {
                queryField = 'email';
                queryValue = email;
            } else if (phone) {
                queryField = 'phone';
                queryValue = phone;
            } else {
                queryField = 'name';
                queryValue = name;
            }
            const results = [];
            for (const collectionName of collections) {
                const collectionRef = db.collection(collectionName);
                const query = collectionRef.where(queryField, '==', queryValue);
                const querySnapshot = await query.get();
                querySnapshot.forEach(doc => {
                    const docId = doc.id;
                    const docData = doc.data();
                    const dataWithId = { ...docData, id: docId, collection: collectionName };
                    results.push(dataWithId);
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: `User not found` });
            }
            res.status(200).json({ message: `User exists`, results });
        } catch (error) {
            res.status(400).json({ message: "Error on request: ", error });
            throw error;
        }
    },

    // Get user by UID from mobile_user collection
    async searchByUID(req, res, next) {
        try {
            const { uid } = req.body;

            if (!uid) {
                return res.status(400).json({ message: "UID is required" });
            } else if (typeof uid !== 'string') {
                return res.status(400).json({ message: "UID must be a string" });
            }

            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            if (!collectionName) {
                throw new Error("Error: Collection not found");
            }

            const mobileUserCollectionRef = db.collection(collectionName);
            const userDocRef = mobileUserCollectionRef.doc(uid);
            const docSnapshot = await userDocRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: "User not found" });
            }

            const userData = docSnapshot.data();
            res.status(200).json(userData);
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).json({ message: "Internal server error" });
            next(error);
        }
    },

    async unblockIP(req, res, next) {
        try {
            const { ip } = req.body;
    
            if (!ip) {
                return res.status(400).json({ message: "IP is required" });
            }
    
            const db = getFirestore();
            const blockedIPCollectionRef = db.collection(process.env.BLOCKEDIPCOLLECTIONNAME);
            const querySnapshot = await blockedIPCollectionRef.where('ip', '==', ip).get();
    
            if (querySnapshot.empty) {
                return res.status(404).json({ message: "IP not found in the blocked IPs collection" });
            }
            querySnapshot.forEach(async doc => {
                await blockedIPCollectionRef.doc(doc.id).delete();
            });
    
            res.status(200).json({ message: "IP unblocked successfully" });
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).json({ message: "Internal server error" });
            next(error);
        }
    }
};

module.exports = UtilsServerController;
