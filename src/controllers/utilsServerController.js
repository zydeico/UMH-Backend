const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const UtilsServerController = {
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
    
            res.status(200).json(separatedResults);
        } catch (error) {
            res.status(400).json({ message: "Error on request: ", error });
            throw error;
        }
    }              
};

module.exports = UtilsServerController;
