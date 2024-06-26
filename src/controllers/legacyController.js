require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const LegacyController = {
    /**
     * Registers a legacy contact.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<Object>} The response object containing the status and data.
     * @throws {Error} If an unexpected error occurs.
     */
    async registerLegacyContact(req, res) {
        try {
            const uid = req.body.uid;
            const legacy = req.body.Legacy;
    
            if (!uid || !legacy || !Array.isArray(legacy) || legacy.length === 0) {
                return res.status(400).json({ message: 'Missing uid or Legacy array' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const legacyCollectionRef = mobileUserDocRef.collection(process.env.LEGACYSUBCOLLECTION);
    
            const promises = legacy.map(async (legacyItem) => {
                const snapshot = await legacyCollectionRef.where(`Legacy.legacyEmail`, '==', legacyItem.legacyEmail)
                    .where(`Legacy.legacyFullName`, '==', legacyItem.legacyFullName)
                    .where(`Legacy.legacyPhone`, '==', legacyItem.legacyPhone)
                    .get();
    
                if (!snapshot.empty) {
                    return res.status(401).json({ message: 'Legacy contact already exists' });
                }
    
                const newLegacyDocRef = legacyCollectionRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Legacy: {
                        legacyFullName: legacyItem.legacyFullName,
                        legacyEmail: legacyItem.legacyEmail,
                        legacyPhone: legacyItem.legacyPhone,
                        legacyPIN: legacyItem.legacyPIN,
                        dateAdded: now.replace('T', ' '),
                        legacyID: newLegacyDocRef.id
                    }
                };
                await newLegacyDocRef.set(dataToSave);
                return { legacyID: newLegacyDocRef.id };
            });
    
            const successfullyAddedLegacyIDs = await Promise.all(promises);
            return res.status(200).json({ message: 'Legacy Contact added successfully', data: successfullyAddedLegacyIDs });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves legacy contacts for a given user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the retrieved legacy contacts.
     * @throws {Error} If an unexpected error occurs.
     */
    async getLegacyContacts(req, res) {
        try {
            const uid = req.body.uid;
            if (!uid) {
                return res.status(404).json({ message: 'Missing uid' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            if (!process.env.LEGACYSUBCOLLECTION) {
                return res.status(500).json({ message: 'Legacy subcollection not found' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const legacyCollectionRef = mobileUserDocRef.collection(process.env.LEGACYSUBCOLLECTION);
            const legacyArray = [];

            const snapshot = await legacyCollectionRef.get();
            snapshot.forEach((doc) => {
                const legacyData = doc.data().Legacy;
                legacyArray.push(legacyData);
            });

            if (legacyArray.length === 0) {
                return res.status(202).json({ message: 'No legacy contacts found', data: [] });
            }

            return res.status(200).json({ data: legacyArray });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a legacy contact.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteLegacyContact(req, res) {
        try {

            const uid = req.body.uid;
            const legacyIDToDelete = req.body.legacyID;

            if (!uid || !legacyIDToDelete) {
                return res.status(404).json({ message: 'Missing uid or legacyID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const legacyCollectionRef = mobileUserDocRef.collection(process.env.LEGACYSUBCOLLECTION).doc(legacyIDToDelete);
            const docSnapshot = await legacyCollectionRef.get();

            if (docSnapshot.empty) {
                return res.status(202).json({ message: 'No legacy contacts found', data: [] });
            }

            await legacyCollectionRef.delete();
            return res.status(200).json({ message: 'Legacy contact deleted successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a legacy contact for a user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async updateLegacyContact(req, res) {
        try {
            const uid = req.body.uid;
            const legacyID = req.body.legacyID;
            const updateLegacyData = req.body.NewInformation;

            if (!uid || !legacyID || !updateLegacyData) {
                return res.status(404).json({ message: 'Missing uid, legacyID or NewInformation' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            if (typeof legacyID !== 'string' || legacyID.trim() === '') {
                return res.status(400).json({ message: 'Invalid legacyID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const legacyCollectionRef = mobileUserDocRef.collection(process.env.LEGACYSUBCOLLECTION).doc(legacyID);

            const docSnapshot = await legacyCollectionRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'No legacy contact found with the specified legacyID for the user' });
            }

            await legacyCollectionRef.set({
                Legacy: {
                    ...docSnapshot.data().Legacy,
                    ...updateLegacyData
                }
            }, { merge: true });

            return res.status(200).json({ message: 'Legacy contact updated successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = LegacyController;