require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
    "Wisconsin", "Wyoming"
];

const familyMembers = [
    "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother",
    "Great-grandfather", "Great-grandmother", "Great-great-grandfather", "Great-great-grandmother",
    "Uncle", "Aunt", "Great-uncle", "Great-aunt",
    "Cousin (male)", "Cousin (female)", "Second cousin (male)", "Second cousin (female)",
    "Nephew", "Niece", "Great-nephew", "Great-niece",
    "Son", "Daughter", "Stepson", "Stepdaughter",
    "Grandson", "Granddaughter", "Great-grandson", "Great-granddaughter", "Great-great-grandson", "Great-great-granddaughter",
    "Stepfather", "Stepmother",
    "Brother-in-law", "Sister-in-law",
    "Son-in-law", "Daughter-in-law",
    "Father-in-law", "Mother-in-law",
    "Godson", "Goddaughter", "Godfather", "Godmother",
    "Partner", "Boyfriend", "Girlfriend",
    "Half-brother", "Half-sister",
    "Fiancé (male)", "Fiancée (female)",
    "Spouse", "Husband", "Wife"
];

const UtilsServerController = {
    /*
    * Get and search for a specific email in multiple collections
    * Allows to search for a specific email in multiple collections and return the results separated by collection
    */
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
            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;
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
            const collectionName = process.env.MOBILEUSERCOLLECTIONNAME;
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
    },
    
    // Insert states into the database
    async insertStates(req, res, next) {
        try {
            const mainCollectionName = db.collection(process.env.CONFIGURATIONVALUESCOLLECTION);
            const docRef = mainCollectionName.doc(process.env.STATESSUBCOLLECTION);
            await docRef.set({ unitedStates: states }, { merge: true });
            res.status(200).json({ message: "States inserted successfully" });
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).json({ message: "Internal server error" });
            next(error);
        }
    },

    // Insert familiar into the database
    async insertFamiliars(req, res, next) {
        try {
            const mainCollectionName = db.collection(process.env.CONFIGURATIONVALUESCOLLECTION);
            const docRef = mainCollectionName.doc(process.env.FAMILIARCOLLECTION);
            await docRef.set({ FamilyMembersEN: familyMembers }, { merge: true });
            res.status(200).json({ message: "Familiar info inserted successfully" });
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).json({ message: "Internal server error" });
            next(error);
        }
    },

    // Link email and phone to Firebase account
    async linkEmailAndPhoneToFirebaseAccount(req, res) {
        try {
            const { email, phone } = req.body;
            if (!email || !phone) {
                return res.status(400).json({ message: "Both email and phone number are required" });
            }

            const auth = require('firebase-admin').auth();
            const emailUserRecord = await auth.getUserByEmail(email);
            const uid = emailUserRecord.uid;

            await auth.updateUser(uid, {
                phoneNumber: phone
            });

            res.status(200).json({ message: "Email and phone linked to Firebase account successfully" });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                return res.status(404).json({ message: "User not found with the provided email" });
            }
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    // Warning: This route will delete all users from the database
    async deleteAllFirebaseUsers(req, res, next) {
        try {
            const auth = require('firebase-admin').auth();
            const listUsersResult = await auth.listUsers();
            const users = listUsersResult.users;
            const deletionPromises = users.map(user => {
                return auth.deleteUser(user.uid);
            });
    
            await Promise.all(deletionPromises);
            return res.status(200).json({ message: 'All Firebase users deleted successfully' });
        } catch (error) {
            console.error('Error deleting Firebase users:', error);
            return res.status(500).json({ message: 'Unexpected error', data: [] });
        }
    }    
};

module.exports = UtilsServerController;
