require('dotenv').config()

const { getFirestore } = require('firebase-admin/firestore')
const db = getFirestore()

const GiftsController = {
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
                        giftTypeDetailDescription: gifts.giftTypeDetailDescription,
                        giftToReason: gifts.giftToReason,
                        giftAccomplished: gifts.giftAccomplished,
                        giftDescription: gifts.giftDescription,
                        giftLinkURL: gifts.giftLinkURL,
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
    }
};

module.exports = GiftsController;