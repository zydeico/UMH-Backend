require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const DistributionsController = {
    /**
     * Registers a distribution.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     * @throws {Error} If an unexpected error occurs.
     */
    async registerDistribution(req, res) {
        try {
            const uid = req.body.uid;
            const distributions = req.body.Distribution;

            if (!uid || !distributions || !Array.isArray(distributions) || distributions.length === 0) {
                return res.status(404).json({ message: 'Missing uid or distributions' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const successFullyAddedDistributions = [];
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const distributionsDocRef = mobileUserDocRef.collection(process.env.DISTRIBUTIONSSUBCOLLECTION);

            const promises = distributions.map(async (distributions) => {
                const newDistributionDocRef = distributionsDocRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Distribution: {
                        distributionTo: distributions.distributionTo,
                        distributionAmmount: distributions.distributionAmmount,
                        distributionReason: distributions.distributionReason,
                        distributionRelationShip: distributions.distributionRelationShip,
                        dateAdded: now.replace('T', ' '),
                        distributionID: newDistributionDocRef.id
                    },
                };

                await newDistributionDocRef.set(dataToSave);
                successFullyAddedDistributions.push({
                    distributionID: newDistributionDocRef.id
                });
            });

            await Promise.all(promises);
            return res.status(200).json({ message: 'Distributions added successfully', data: successFullyAddedDistributions });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves distributions data for a given user ID.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the distributions data.
     * @throws {Error} If an unexpected error occurs.
     */
    async geDistribution(req, res) {
        try {
            const uid = req.body.uid;
            if (!uid) {
                return res.status(400).json({ message: 'Missing uid' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(401).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.DISTRIBUTIONSSUBCOLLECTION);
            const snapshot = await mobileUserDocRef.get();

            if (snapshot.empty) {
                return res.status(202).json({ message: 'No distributions found', data: [] });
            }

            let distributionsData = [];
            snapshot.forEach(doc => {
                distributionsData.push(doc.data().Distribution);
            });

            return res.status(200).json({
                data: distributionsData
            })

        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a distribution.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteDistribution(req, res) {
        try {
            const uid = req.body.uid;
            const distributionIdToDelete = req.body.distributionID
            
            if (!uid || !distributionIdToDelete) {
                return res.status(404).json({ message: 'Missing uid or distributionID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const distributionDocRef = mobileUserDocRef.collection(process.env.DISTRIBUTIONSSUBCOLLECTION).doc(distributionIdToDelete);
            const docSnapshot = await distributionDocRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'No distribution found' });
            }

            await distributionDocRef.delete();
            return res.status(200).json({ message: 'Distribution deleted successfully' });

        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a distribution in the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async updateDistribution(req, res) {
        try {
            const uid = req.body.uid;
            const distributionID = req.body.distributionID;
            const updateDistribution = req.body.NewInformation;

            if (!uid || !distributionID) {
                return res.status(404).json({ message: 'Missing uid or distributionID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            if (typeof updateDistribution !== 'object' || !updateDistribution.distributionTo || !updateDistribution.distributionAmmount || !updateDistribution.distributionReason || !updateDistribution.distributionRelationShip) {
                return res.status(400).json({ message: 'Invalid distribution format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const distributionDocRef = mobileUserDocRef.collection(process.env.DISTRIBUTIONSSUBCOLLECTION).doc(distributionID);
            const docSnapshot = await distributionDocRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'No distribution found' });
            }

            await distributionDocRef.set({
                Distribution: {
                    ...docSnapshot.data().Distribution,
                    ...updateDistribution
                }
            }, { merge: true });

            return res.status(200).json({ message: 'Distribution updated successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = DistributionsController;
