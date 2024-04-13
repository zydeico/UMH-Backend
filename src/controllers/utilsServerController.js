const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const UtilsServerController = {
    async getAndSearchSpecificEmailFromEmails(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email parameter is missing" });
            } else {
                if (typeof email !== 'string') {
                    return res.status(400).json({ message: "Email parameter is not a string" });
                }
            }
            const emailCollectionRef = db.collection('mobile_user');
            const query = emailCollectionRef.where('email', '==', email);
            const querySnapshot = await query.get();
            const docs = [];
            querySnapshot.forEach(doc => {
                const docId = doc.id;
                const docData = doc.data();
                const dataWithId = { ...docData, id: docId };
                docs.push(dataWithId);
            });
    
            if (docs.length === 0) {
                return res.status(404).json({ message: "Email not found" });
            }

            res.status(200).json(docs);
        } catch (error) {
            res.status(400).json({ message: "Error on request: ", error });
            throw error;
        }
    },      
};

module.exports = UtilsServerController;
