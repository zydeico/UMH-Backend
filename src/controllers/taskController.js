require('dotenv').config()

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const TaskController = {
    /**
     * Registers a new task.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     * @throws {Error} If an unexpected error occurs.
     */
    async registerNewTask(req, res) {
        try {
            const uid = req.body.uid;
            const tasks = req.body.Task;

            if (!uid || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
                return res.status(404).json({ message: 'Missing uid or tasks' });
            }

            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }

            const mobileUserCollectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const tasksSubCollectionName = process.env.TASKSSUBCOLLECTION;

            if (!mobileUserCollectionName || !tasksSubCollectionName) {
                return res.status(500).json({ message: 'Server configuration error: Missing collection names' });
            }

            const successfullyAddedTasks = [];
            const mobileUserDocRef = db.collection(mobileUserCollectionName).doc(uid);
            const taskDocRef = mobileUserDocRef.collection(tasksSubCollectionName);

            const promises = tasks.map(async (task) => {
                const newTaskDocRef = taskDocRef.doc();
                const now = new Date().toISOString().split('.')[0];
                const dataToSave = {
                    Task: {
                        taskName: task.taskName,
                        taskDescription: task.taskDescription,
                        taskFileURL: task.taskFileURL,
                        taskCompleted: task.taskCompleted === 'true',
                        taskCreationDate: now.replace('T', ' '),
                        taskID: newTaskDocRef.id
                    },
                };

                await newTaskDocRef.set(dataToSave);
                successfullyAddedTasks.push({
                    taskID: newTaskDocRef.id
                });
            });

            await Promise.all(promises);
            return res.status(200).json({ message: 'Tasks added successfully', data: successfullyAddedTasks });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves all tasks for a given user ID.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object containing the tasks data or an error message.
     */
    async getAllTasks(req, res) {
        try {
            const uid = req.body.uid;
    
            if (!uid) {
                return res.status(404).json({ message: 'Missing uid' });
            }
    
            if (typeof uid !== 'string' || uid.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID format' });
            }
    
            const mobileUserCollectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const tasksSubCollectionName = process.env.TASKSSUBCOLLECTION;
    
            if (!mobileUserCollectionName || !tasksSubCollectionName) {
                return res.status(500).json({ message: 'Server configuration error: Missing collection names' });
            }
    
            const mobileUserDocRef = db.collection(mobileUserCollectionName).doc(uid);
            const taskDocRef = mobileUserDocRef.collection(tasksSubCollectionName);
            const tasksSnapshot = await taskDocRef.get();
            const tasks = [];
    
            tasksSnapshot.forEach((doc) => {
                tasks.push(doc.data().Task);
            });
    
            if (tasks.length === 0) {
                return res.status(202).json({ message: 'No tasks found', data: [] });
            }
            
            return res.status(200).json({ data: tasks });
        } catch (error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Deletes a task from the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async deleteTask(req, res) {
        try {
            const uid = req.body.uid;
            const taskID = req.body.taskID;

            if (!uid || !taskID) {
                return res.status(404).json({ message: 'Missing uid or taskID' });
            }

            if (typeof uid !== 'string' || uid.trim() === '' || typeof taskID !== 'string' || taskID.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID or taskID format' });
            }

            const mobileUserCollectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const tasksSubCollectionName = process.env.TASKSSUBCOLLECTION;

            if (!mobileUserCollectionName || !tasksSubCollectionName) {
                return res.status(500).json({ message: 'Server configuration error: Missing collection names' });
            }

            const mobileUserDocRef = db.collection(mobileUserCollectionName).doc(uid);
            const taskDocRef = mobileUserDocRef.collection(tasksSubCollectionName).doc(taskID);
            const taskSnapshot = await taskDocRef.get();

            if (!taskSnapshot.exists) {
                return res.status(404).json({ message: 'Task not found' });
            }

            await taskDocRef.delete();
            return res.status(200).json({ message: 'Task deleted successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Updates a task in the database.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object.
     */
    async updateTask(req, res) {
        try {
            const uid = req.body.uid;
            const taskID = req.body.taskID;
            const updatedTask = req.body.NewInformation;

            if (!uid || !taskID || !updatedTask) {
                return res.status(404).json({ message: 'Missing uid, taskID or updatedTask' });
            }

            if (typeof uid !== 'string' || uid.trim() === '' || typeof taskID !== 'string' || taskID.trim() === '') {
                return res.status(400).json({ message: 'Invalid UID or taskID format' });
            }

            if (!updatedTask.taskName || !updatedTask.taskDescription || !updatedTask.taskFileURL || updatedTask.taskCompleted === undefined) {
                return res.status(400).json({ message: 'Missing taskName, taskDescription, taskFileURL or taskCompleted' });
            }

            const mobileUserCollectionName = process.env.MOBILEUSERCOLLECTIONNAME;
            const taskDocRef = db.collection(mobileUserCollectionName).doc(uid).collection(process.env.TASKSSUBCOLLECTION).doc(taskID);
            const docSnapshot = await taskDocRef.get();

            if (!docSnapshot.exists) {
                return res.status(404).json({ message: 'Task not found' });
            }

            await taskDocRef.set({
                Task: {
                    ...docSnapshot.data().Task,
                    ...updatedTask
                }
            }, { merge: true });

            return res.status(200).json({ message: 'Task updated successfully' });
        } catch(error) {
            return res.status(500).send({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = TaskController;