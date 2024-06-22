require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const CardsController = {
    /**
     * Registers a card for a user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with a status and message.
     * @throws {Error} If an unexpected error occurs.
     */
    async registerCard(req, res) {
        try {
            const uid = req.body.uid;
            const cards = req.body.Card;
    
            if (!uid || !cards || !Array.isArray(cards) || cards.length === 0) {
                return res.status(404).json({ message: 'Missing uid or cards' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const successfullyAddedCards = [];
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const cardCollectionRef = mobileUserDocRef.collection(process.env.CARDSSUBCOLLECTION);
    
            const promises = cards.map(async (card) => {
                const newCardDocRef = cardCollectionRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Card: {
                        cardTitle: card.cardTitle,
                        cardFamiliar: card.cardFamiliar,
                        cardFileURL: card.fileURL,
                        cardMessage: card.cardMessage,
                        dateAdded: now.replace('T', ' '),
                        cardID: newCardDocRef.id
                    },
                };
    
                await newCardDocRef.set(dataToSave);
                successfullyAddedCards.push({
                    cardID: newCardDocRef.id
                });
            });
    
            await Promise.all(promises);
    
            return res.status(200).json({ message: 'Cards added successfully', data: successfullyAddedCards });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves the cards for a specified user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the cards data.
     * @throws {Error} If an unexpected error occurs.
     */
    async getCards(req, res) {
        try {
            const uid = req.body.uid;
    
            if (!uid) {
                return res.status(400).json({ message: 'Missing uid' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.CARDSSUBCOLLECTION);
    
            const snapshot = await mobileUserDocRef.get();
            if (snapshot.empty) {
                return res.status(404).json({ message: 'No cards found for the specified user', data: [] });
            }
    
            let cardData = [];
            snapshot.forEach(doc => {
                cardData.push(doc.data().Card);
            });
    
            return res.status(200).json({ data: cardData });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a card from the user's collection.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the status and message.
     */
    async deleteCard(req, res) {
        try {
            const uid = req.body.uid;
            const cardIDToDelete = req.body.cardID;
    
            if (!uid || !cardIDToDelete) {
                return res.status(400).json({ message: 'Missing uid or cardID' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const cardCollectionRef = mobileUserDocRef.collection(process.env.CARDSSUBCOLLECTION).doc(cardIDToDelete);
            const docSnapshot = await cardCollectionRef.get();
            
            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'No card found with the specified cardID for the user' });
            }
            
            await cardCollectionRef.delete();
            return res.status(200).json({ message: 'Card deleted successfully' });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a card with the provided data.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with a success or error message.
     */
    async updateCard(req, res) {
        try {
            const uid = req.body.uid;
            const cardID = req.body.cardID;
            const updatedCardData = req.body.NewInformation;
            
            if (!uid || !cardID || !updatedCardData) {
                return res.status(400).json({ message: 'Missing uid, cardID, or card data' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            if (typeof updatedCardData !== 'object' || !updatedCardData.cardFamiliarMemberToWhom || !updatedCardData.cardFileURL || !updatedCardData.cardType || !updatedCardData.cardTitle) {
                return res.status(400).json({ message: 'Invalid Information format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const cardDocRef = mobileUserDocRef.collection(process.env.CARDSSUBCOLLECTION).doc(cardID);
    
            const docSnapshot = await cardDocRef.get();
    
            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'Card not found' });
            }
    

            await cardDocRef.set({
                Card: {
                    ...docSnapshot.data().Card,
                    ...updatedCardData
                }
            }, { merge: true });
    
            return res.status(200).json({ message: 'Card updated successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    }    
};

module.exports = CardsController;