require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const { get } = require('mongoose');
const db = getFirestore();

const FavoritesController = {
    /**
     * Registers a favorite by saving it to the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing a success message and the added favorites.
     * @throws {Object} The response object containing an error message if an unexpected error occurs.
     */
    async registerFavorite(req, res) {
        try {
            const uid = req.body.uid;
            const favorites = req.body.Favorite;

            if (!uid || !favorites || !Array.isArray(favorites) || favorites.length === 0) {
                return res.status(404).json({ message: 'Missing uid or favorites' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const successfullyAddedFavorites = [];
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const favoriteCollectionRef = mobileUserDocRef.collection(process.env.FAVORITESSUBCOLLECTION);

            const promises = favorites.map(async (favorite) => {
                const newFavoriteDocRef = favoriteCollectionRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Favorite: {
                        favoriteTitle: favorite.favoriteTitle,
                        favoriteType: favorite.favoriteType,
                        favoriteCategory: favorite.favoriteCategory,
                        favoriteLink: favorite.favoriteLink,
                        dateAdded: now.replace('T', ' '),
                        favoriteID: newFavoriteDocRef.id
                    },
                };

                await newFavoriteDocRef.set(dataToSave);
                successfullyAddedFavorites.push({
                    favoriteID: newFavoriteDocRef.id
                });
            });

            await Promise.all(promises);

            return res.status(200).json({ message: 'Favorites added successfully', data: successfullyAddedFavorites });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves the favorites for a given user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the retrieved favorites.
     * @throws {Error} If an unexpected error occurs.
     */
    async getFavorites(req, res) {
        try {
            const uid = req.body.uid;
    
            if (!uid) {
                return res.status(404).json({ message: 'Missing uid' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            if (!process.env.FAVORITESSUBCOLLECTION) {
                return res.status(202).json({ message: 'Favorites subcollection not defined', data: [] });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const favoriteCollectionRef = mobileUserDocRef.collection(process.env.FAVORITESSUBCOLLECTION);
            const favorites = [];
    
            const snapshot = await favoriteCollectionRef.get();
            snapshot.forEach((doc) => {
                const favorite = doc.data().Favorite;
                favorites.push(favorite);
            });
    
            if (favorites.length === 0) {
                return res.status(202).json({ message: 'No favorites found', data: [] });
            }
    
            return res.status(200).json({ data: favorites });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a favorite from the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteFavorite(req, res) {
        try {
            const uid = req.body.uid;
            const favoriteID = req.body.favoriteID;

            if (!uid || !favoriteID) {
                return res.status(404).json({ message: 'Missing uid or favoriteID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '' || typeof favoriteID !== 'string' || favoriteID.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID or favoriteID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const favoriteDocRef = mobileUserDocRef.collection(process.env.FAVORITESSUBCOLLECTION).doc(favoriteID);

            const snapshot = await favoriteDocRef.get();
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Favorite not found' });
            }

            await favoriteDocRef.delete();

            return res.status(200).json({ message: 'Favorite deleted successfully' });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a favorite in the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} req.body - The request body.
     * @param {string} req.body.uid - The user ID.
     * @param {string} req.body.favoriteID - The favorite ID.
     * @param {Object} req.body.favorite - The favorite object containing the updated data.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with a success or error message.
     */
    async updateFavorite(req, res) {
        try {
            const uid = req.body.uid;
            const favoriteID = req.body.favoriteID;
            const updateFavoriteData = req.body.NewInformation;

            if (!uid || !favoriteID || !updateFavoriteData) {
                return res.status(404).json({ message: 'Missing uid, favoriteID, or favorite' });
            }

            if (typeof uid !== 'string' || uid.trim() === '' || typeof favoriteID !== 'string' || favoriteID.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID or favoriteID format' });
            }

            if (typeof updateFavoriteData !== 'object' || !updateFavoriteData.favoriteTitle || !updateFavoriteData.favoriteType || !updateFavoriteData.favoriteCategory || !updateFavoriteData.favoriteLink) {
                return res.status(400).json({ message: 'Invalid Information format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const favoriteDocRef = mobileUserDocRef.collection(process.env.FAVORITESSUBCOLLECTION).doc(favoriteID);

            const snapshot = await favoriteDocRef.get();

            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Favorite not found' });
            }

            await favoriteDocRef.set({
                Favorite: {
                    ...snapshot.data().Favorite,
                    ...updateFavoriteData
                }
            })

            return res.status(200).json({ message: 'Favorite updated successfully' });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = FavoritesController;