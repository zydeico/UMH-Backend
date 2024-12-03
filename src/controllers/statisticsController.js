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
    
            // Total value, remove this and use the value from database
            const total = 5;
    
            // Letters
            const lettersCollectionRef = mobileUserDocRef.collection(process.env.LETTERSSUBCOLLECTION);
            const lettersSnapshot = await lettersCollectionRef.get();
            const Letters = lettersSnapshot.size || 0;
    
            // Contacts
            const contactsCollectionRef = mobileUserDocRef.collection(process.env.CONTACTSSUBCOLLECTION);
            const contactsSnapshot = await contactsCollectionRef.get();
            const Contacts = contactsSnapshot.size || 0;
    
            // Family
            const familyCollectionRef = mobileUserDocRef.collection(process.env.FAMILIARSUBCOLLECTION);
            const familySnapshot = await familyCollectionRef.get();
            const Family = familySnapshot.size || 0;
    
            // Gifts
            const giftsCollectionRef = mobileUserDocRef.collection(process.env.GIFTSSUBCOLLECTION);
            const giftsSnapshot = await giftsCollectionRef.get();
            const Gifts = giftsSnapshot.size || 0;
    
            // Notes
            const notesCollectionRef = mobileUserDocRef.collection(process.env.NOTESSUBCOLLECTION);
            const notesSnapshot = await notesCollectionRef.get();
            const Notes = notesSnapshot.size || 0;
    
            const statistics = [
                { type: "Letters", current: Letters, total },
                { type: "Contacts", current: Contacts, total },
                { type: "Family", current: Family, total },
                { type: "Gifts", current: Gifts, total },
                { type: "Notes", current: Notes, total }
            ];
            
            return res.status(200).json({ 
                data: { Statistics: statistics }
            });
    
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = StatisticsController;