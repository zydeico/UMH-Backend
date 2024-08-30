require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const StatisticsController = {
    /**
     * Retrieves statistics for a user.
     * 
     * @async
     * @function getStatistics
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the statistics data.
     * @throws {Object} The response object containing an error message if an unexpected error occurs.
     */
    async getStatistics(req, res) {
        try {
            const uid = req.body.uid;
    
            if (!uid) {
                return res.status(400).json({ message: 'Missing uid' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const userDoc = await mobileUserDocRef.get();

            if (!userDoc.exists) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Letters
            const cardsCollectionRef = mobileUserDocRef.collection(process.env.LETTERSSUBCOLLECTION);
            const cardsSnapshot = await cardsCollectionRef.get();
            const Letters = cardsSnapshot.size || 0;
    
            // Contacts
            const contactsCollectionRef = mobileUserDocRef.collection(process.env.CONTACTSSUBCOLLECTION);
            const contactsSnapshot = await contactsCollectionRef.get();
            const Contacts = contactsSnapshot.size || 0;
    
            // Family
            const familyCollectionRef = mobileUserDocRef.collection(process.env.FAMILIARSUBCOLLECTION);
            const familySnapshot = await familyCollectionRef.get();
            const Family = familySnapshot.size || 0;

            // GIFTS
            const giftsCollectionRef = mobileUserDocRef.collection(process.env.GIFTSSUBCOLLECTION);
            const giftsSnapshot = await giftsCollectionRef.get();
            const Gifts = giftsSnapshot.size || 0;

            // Notes
            const notesCollectionRef = mobileUserDocRef.collection(process.env.NOTESSUBCOLLECTION);
            const notesSnapshot = await notesCollectionRef.get();
            const Notes = notesSnapshot.size || 0;
    
            return res.status(200).json({ 
                data: {
                    Letters, 
                    Contacts, 
                    Family,
                    Gifts,
                    Notes
                }
            });
    
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    }    
};

module.exports = StatisticsController;