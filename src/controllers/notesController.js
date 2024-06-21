require('dotenv').config()

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const NotesController = {
    /**
     * Registers a new note.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<Object>} The response object containing the status and data.
     * @throws {Error} If an unexpected error occurs.
     */
    async registerNewNote(req, res) {
        try {
            const uid = req.body.uid;
            const notes = req.body.Note; // Asegúrate de usar la propiedad correcta
    
            // Validación de uid
            if (!uid || typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid or missing UID' });
            }
    
            // Validación de notes
            if (!notes || !Array.isArray(notes) || notes.length === 0) {
                return res.status(400).json({ message: 'Invalid or missing notes' });
            }
    
            const successfullyAddedNotes = [];
            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid);
            const noteDocRef = mobileUserDocRef.collection(process.env.NOTESSUBCOLLECTION);
    
            const promises = notes.map(async (note) => {
                const newNoteRef = noteDocRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Note: {
                        noteTitle: note.noteTitle,
                        noteDescription: note.noteDescription,
                        noteFileURL: note.noteFileURL,
                        noteDate: now.replace('T', ' '),
                        noteID: newNoteRef.id
                    },
                };
    
                await newNoteRef.set(dataToSave);
                successfullyAddedNotes.push({
                    noteID: newNoteRef.id
                });
            });
    
            await Promise.all(promises);
            return res.status(200).json({ message: 'Notes added successfully', data: successfullyAddedNotes });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },    

    /**
     * Retrieves all notes for a given user.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the retrieved notes.
     * @throws {Object} The response object containing an error message if an unexpected error occurs.
     */
    async getAllNotes(req, res) {
        try {
            
            const uid = req.body.uid;

            if (!uid || typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid or missing UID' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.NOTESSUBCOLLECTION);
            const snapshot = await mobileUserDocRef.get();

            if (snapshot.empty) {
                return res.status(404).json({ message: 'No notes found' });
            }

            let notes = [];
            snapshot.forEach((doc) => {
                notes.push(doc.data().Note);
            });

            return res.status(200).json({ data: notes });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a note.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with a status and message.
     */
    async deleteNote(req, res) {
        try {
            const uid = req.body.uid;
            const noteID = req.body.noteID;

            if (!uid || typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid or missing UID' });
            }

            if (!noteID || typeof noteID !== 'string' || noteID.trim() === '') {
                return res.status(400).json({ message: 'Invalid or missing noteID' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.NOTESSUBCOLLECTION);
            const noteDocRef = mobileUserDocRef.doc(noteID);
            const doc = await noteDocRef.get();

            if (!doc.exists) {
                return res.status(404).json({ message: 'Note not found' });
            }

            await noteDocRef.delete();
            return res.status(200).json({ message: 'Note deleted successfully' });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a note in the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async updateNote(req, res) {
        try {
            const uid = req.body.uid;
            const noteID = req.body.noteID;
            const note = req.body.NewInformation;

            if (!uid || typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid or missing UID' });
            }

            if (!noteID || typeof noteID !== 'string' || noteID.trim() === '') {
                return res.status(400).json({ message: 'Invalid or missing noteID' });
            }

            if (!note || typeof note !== 'object' || Object.keys(note).length === 0) {
                return res.status(400).json({ message: 'Invalid or missing note' });
            }

            const mobileUserDocRef = db.collection(process.env.MOBILEUSERCOLLECTIONNAME).doc(uid).collection(process.env.NOTESSUBCOLLECTION);
            const noteDocRef = mobileUserDocRef.doc(noteID);
            const doc = await noteDocRef.get();

            if (!doc.exists) {
                return res.status(404).json({ message: 'Note not found' });
            }

            const now = new Date().toISOString().split('.')[0];
            const dataToUpdate = {
                Note: {
                    ...doc.data().Note,
                    ...note
                },
            };

            await noteDocRef.update(dataToUpdate);
            return res.status(200).json({ message: 'Note updated successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = NotesController;
