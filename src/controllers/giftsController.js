require('dotenv').config()

const { getFirestore } = require('firebase-admin/firestore')
const db = getFirestore()

const GiftsController = {
    /**
     * Registers a new gift.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the status and data.
     * @throws {Error} If an unexpected error occurs.
     */
    async registerNewGift(req, res) {
        try {
            const uid = req.body.uid;
            const gifts = req.body.Gift;
    
            if (!uid || !gifts || !Array.isArray(gifts) || gifts.length === 0) {
                return res.status(404).json({ message: 'Missing uid or gifts' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const successFullyAddedGifts = [];
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const giftDocRef = mobileUserDocRef.collection(process.env.GIFTSSUBCOLLECTION);

            const promises = gifts.map(async (gifts) => {
                const newGiftDocRef = giftDocRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Gift: {
                        lovedPersonToGift: gifts.lovedPersonToGift,
                        giftType: gifts.giftType,
                        giftFileURL: gifts.giftFileURL,
                        giftDescription: gifts.giftDescription,
                        dateAdded: now.replace('T', ' '),
                        giftID: newGiftDocRef.id
                    },
                };

                await newGiftDocRef.set(dataToSave);
                successFullyAddedGifts.push({
                    giftID: newGiftDocRef.id
                })
            });

            await Promise.all(promises);
            return res.status(200).json({ message: 'Gifts added successfully', data: successFullyAddedGifts });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves all gifts for a given user ID.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the gifts data or an error message.
     */
    async getAllGifts(req, res) {
        try {
            const uid = req.body.uid;
            if (!uid) {
                return res.status(404).json({ message: 'Missing uid' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.GIFTSSUBCOLLECTION);
            const snapshot = await mobileUserDocRef.get();
            if(snapshot.empty) {
                return res.status(202).json({ message: 'No gifts found', data: [] });
            }

            let gifts = [];
            snapshot.forEach(doc => {
                gifts.push(doc.data().Gift);
            });

            return res.status(200).json({ data: gifts });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a gift.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteGift(req, res) {
        try {
            const uid = req.body.uid;
            const giftID = req.body.giftID;

            if (!uid || !giftID) {
                return res.status(400).json({ message: 'Missing uid or giftID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const giftDocRef = mobileUserDocRef.collection(process.env.GIFTSSUBCOLLECTION).doc(giftID);
            const docSnapshot = await giftDocRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'Gift not found' });
            }

            await giftDocRef.delete();
            return res.status(200).json({ message: 'Gift deleted successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a gift in the database.
     * 
     * @param {Object} req - The request object.
     * @param {Object} req.body - The request body.
     * @param {string} req.body.uid - The UID of the user.
     * @param {string} req.body.giftID - The ID of the gift.
     * @param {Object} req.body.NewInformation - The updated gift information.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with a success or error message.
     */
    async updateGift(req, res) {
        try {
            const uid = req.body.uid;
            const giftID = req.body.giftID;
            const updatedGift = req.body.NewInformation;
    
            if (!uid || !giftID || !updatedGift) {
                return res.status(400).json({ message: 'Missing uid, giftID or NewInformation' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            if (typeof updatedGift !== 'object' || !updatedGift.lovedPersonToGift || !updatedGift.giftType || !updatedGift.giftFileURL || !updatedGift.giftDescription) {
                return res.status(400).json({ message: 'Invalid NewInformation format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const giftDocRef = mobileUserDocRef.collection(process.env.GIFTSSUBCOLLECTION).doc(giftID);
            const docSnapshot = await giftDocRef.get();
    
            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'Gift not found' });
            }
            
            await giftDocRef.set({
                Gift: {
                    ...docSnapshot.data().Gift,
                    ...updatedGift
                }
            }, { merge: true });
    
            return res.status(200).json({ message: 'Gift updated successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }    
};

module.exports = GiftsController;