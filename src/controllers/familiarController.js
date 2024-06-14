require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const FamiliarController = {
    // This endpoint is used to get family members of a user
    async getRegisteredFamily(req, res) {
        try {
            const uid = req.body.uid;

            if (!uid) {
                return res.status(400).json({ message: 'Missing uid' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format', data: [] });
            }

            const keys = Object.keys(req.body);

            if (keys.length !== 1 || keys[0] !== 'uid') {
                return res.status(400).json({ message: 'Only one UID is allowed in the request body', data: [] });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.FAMILIARSUBCOLLECTION);
            
            try {
                const snapshot = await mobileUserDocRef.get();
                if (snapshot.empty) {
                    return res.status(404).json({ message: 'No data found', data: [] });
                }

                let familyData = [];
                snapshot.forEach(doc => {
                    familyData.push(doc.data());
                });

                return res.status(200).json({ data: familyData });

            } catch (error) {
                return res.status(500).send({ message: error.message });
            }
        } catch (error) {
            return res.status(500).send({ message: "Unexpected error: ", error: error.message });
        }
    },

    // This endpoint is used to add a family member to a user
    async addFamilyMember(req, res) {
        try {
            const uid = req.body.uid;
            const familyMembers = req.body.family;
    
            if (!uid || !familyMembers || !Array.isArray(familyMembers) || familyMembers.length === 0) {
                return res.status(400).json({ message: 'Missing or invalid uid or family array' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            for (let familyMember of familyMembers) {
                if (typeof familyMember !== 'object' || !familyMember.email || !familyMember.name || !familyMember.phone || !familyMember.relationship) {
                    return res.status(400).json({ message: 'Invalid family member format' });
                }
            }
    
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const familyCollectionRef = mobileUserDocRef.collection(process.env.FAMILIARSUBCOLLECTION);
    
            try {
                const newFamilyDocRef = await familyCollectionRef.add({ family: familyMembers });
    
                return res.status(200).json({ message: 'Family members added successfully', data: { familyMemberID: newFamilyDocRef.id } });
    
            } catch (error) {
                return res.status(500).send({ message: error.message });
            }
        } catch (error) {
            return res.status(500).send({ message: "Unexpected error", error: error.message });
        }
    }         
};

module.exports = FamiliarController;