require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const ContactsController = {
    /**
     * Creates a new contact.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the status and data.
     */
    async newContact(req, res) {
        try {
            const uid = req.body.uid;
            const contact = req.body.Contact;

            if (!uid || !contact) {
                return res.status(404).json({ message: 'Missing uid or contact' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const successfullyAddedContacts = [];
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const contactCollectionRef = mobileUserDocRef.collection(process.env.CONTACTSSUBCOLLECTION);

            const promises = contact.map(async (contact) => {
                const newContactDocRef = contactCollectionRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Contact: {
                        contactName: contact.contactName,
                        contactPhone: contact.contactPhone,
                        contactEmail: contact.contactEmail,
                        contactAddress: contact.contactAddress,
                        contactType: contact.contactType,
                        dateAdded: now.replace('T', ' '),
                        contactID: newContactDocRef.id
                    },
                };

                await newContactDocRef.set(dataToSave);
                successfullyAddedContacts.push({
                    contactID: newContactDocRef.id
                });
            });

            await Promise.all(promises);
            return res.status(200).json({ message: 'Contacts added successfully', data: successfullyAddedContacts });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves contacts for a given user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the contacts data or an error message.
     */
    async getContacts(req, res) {
        try {
            const uid = req.body.uid;

            if (!uid) {
                return res.status(404).json({ message: 'Missing uid' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const contactCollectionRef = mobileUserDocRef.collection(process.env.CONTACTSSUBCOLLECTION);
            const snapshot = await contactCollectionRef.get();

            if (snapshot.empty) {
                return res.status(404).json({ message: 'No contacts found' });
            }

            const contacts = [];
            snapshot.forEach((doc) => {
                contacts.push(doc.data().Contact);
            });

            return res.status(200).json({ data: contacts });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a contact.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteContact(req, res) {
        try {
            const uid = req.body.uid;
            const contactID = req.body.contactID;

            if (!uid || !contactID) {
                return res.status(404).json({ message: 'Missing uid or contactID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            if (typeof contactID !== 'string' || contactID.trim() === '') {
                return res.status(400).json({ message: 'Invalid contactID format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const contactCollectionRef = mobileUserDocRef.collection(process.env.CONTACTSSUBCOLLECTION);
            const contactDocRef = contactCollectionRef.doc(contactID);

            const doc = await contactDocRef.get();
            if (!doc.exists) {
                return res.status(404).json({ message: 'Contact not found' });
            }

            await contactDocRef.delete();
            return res.status(200).json({ message: 'Contact deleted successfully' });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    async updateContact(req, res)  {
        try {
            const uid = req.body.uid;
            const contactID = req.body.contactID;
            const contact = req.body.NewInformation;

            if (!uid || !contactID || !contact) {
                return res.status(404).json({ message: 'Missing uid, contactID or contact' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            if (typeof contact !== 'object' || !contact.contactName || !contact.contactPhone || !contact.contactEmail || !contact.contactAddress || !contact.contactType) {
                return res.status(400).json({ message: 'Invalid information format' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const contactDocRef = mobileUserDocRef.collection(process.env.CONTACTSSUBCOLLECTION).doc(contactID);

            const docSnapshot = await contactDocRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'No contact found with the specified contactID for the user' });
            }

            await contactDocRef.set({
                Contact: {
                    contactName: contact.contactName,
                    contactPhone: contact.contactPhone,
                    contactEmail: contact.contactEmail,
                    contactAddress: contact.contactAddress,
                    contactType: contact.contactType
                }
            }, { merge: true });

            return res.status(200).json({ message: 'Contact updated successfully' });

        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = ContactsController;
