require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const FamiliarController = {

    /**
     * Retrieves the registered family members for a specified user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the registered family members.
     * @throws {Error} If an unexpected error occurs.
     */
    async getRegisteredFamily(req, res) {
        try {
            const uid = req.body.uid;

            if (!uid) {
                return res.status(400).json({ message: 'Missing uid' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.FAMILIARSUBCOLLECTION);

            const snapshot = await mobileUserDocRef.get();
            if (snapshot.empty) {
                return res.status(404).json({ message: 'No family members found for the specified user', data: [] });
            }

            let familyData = [];
            snapshot.forEach(doc => {
                familyData.push(doc.data().Member);
            });

            return res.status(200).json({ data: familyData });

        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Adds family members to the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     * @throws {Object} If there is an unexpected error.
     */
    async addFamilyMember(req, res) {
        try {
            const uid = req.body.uid;
            const familyMembers = req.body.Member;
    
            if (!uid || !familyMembers || !Array.isArray(familyMembers) || familyMembers.length === 0) {
                return res.status(400).json({ message: 'Missing or invalid uid or family array' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const successfullyAddedMembers = [];
    
            for (let familyMember of familyMembers) {
                if (typeof familyMember !== 'object' || !familyMember.email || !familyMember.name || !familyMember.phone || !familyMember.relationship) {
                    return res.status(400).json({ message: 'Invalid family member format' });
                }
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const familyCollectionRef = mobileUserDocRef.collection(process.env.FAMILIARSUBCOLLECTION);
    
            const promises = [];
    
            for (let familyMember of familyMembers) {
                const newFamilyDocRef = familyCollectionRef.doc();
                const dataToSave = {
                    Member: {
                        name: familyMember.name,
                        phone: familyMember.phone,
                        email: familyMember.email,
                        relationship: familyMember.relationship,
                        memberID: newFamilyDocRef.id
                    }
                };
    
                promises.push(newFamilyDocRef.set(dataToSave));
                successfullyAddedMembers.push({
                    memberID: newFamilyDocRef.id
                });
            }
    
            await Promise.all(promises);
    
            return res.status(200).json({ message: 'Family member added successfully', InformationMember: successfullyAddedMembers });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a family member.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteFamilyMember(req, res) {
        try {
            const uid = req.body.uid;
            const memberIDToDelete = req.body.memberID;
    
            if (!uid || !memberIDToDelete) {
                return res.status(400).json({ message: 'Missing uid or memberID information' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const familyMemberDocRef = mobileUserDocRef.collection(process.env.FAMILIARSUBCOLLECTION).doc(memberIDToDelete);
    
            const docSnapshot = await familyMemberDocRef.get();
    
            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'Family member not found' });
            }
            
            await familyMemberDocRef.delete();
            return res.status(200).json({ message: 'Family member deleted successfully' });
    
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a family member in the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} req.body - The request body.
     * @param {string} req.body.uid - The UID of the user.
     * @param {string} req.body.memberID - The ID of the family member.
     * @param {Object} req.body.member - The updated member data.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async updateFamilyMember(req, res) {
        try {
            const uid = req.body.uid;
            const memberID = req.body.memberID;
            const updatedInformationData = req.body.NewInformation;
            if (!uid || !memberID || !updatedInformationData) {
                return res.status(400).json({ message: 'Missing uid, memberID, or Information' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            if (typeof updatedInformationData !== 'object' || !updatedInformationData.email || !updatedInformationData.name || !updatedInformationData.phone || !updatedInformationData.relationship) {
                return res.status(400).json({ message: 'Invalid Information format' });
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const familyMemberDocRef = mobileUserDocRef.collection(process.env.FAMILIARSUBCOLLECTION).doc(memberID);
    
            const docSnapshot = await familyMemberDocRef.get();
    
            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'Family member not found' });
            }

            await familyMemberDocRef.set({
                Information: {
                    ...docSnapshot.data().Information,
                    ...updatedInformationData
                }
            }, { merge: true });
    
            return res.status(200).json({ message: 'Family member updated successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    }    
};

module.exports = FamiliarController;