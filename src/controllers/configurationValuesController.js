require('dotenv').config();

const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();

const ConfigurationValuesController = {
    /**
     * Retrieves the links configuration from the database.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the links configuration data.
     */
    async getLinks(req, res) {
        try {
            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.LINKSSUBCOLLECTION).get();
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Links configuration not found' });
            }
            const links = snapshot.data();
            return res.status(200).json({ data: links });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves the states based on the provided language code.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A promise that resolves with the states data or an error response.
     * @throws {Error} - If an unexpected error occurs.
     */
    async getStates(req, res) {
        try {
            const languageCode = req.body.languageCode;

            if (!languageCode) {
                return res.status(400).json({ message: 'Missing language code in the request body' });
            }

            let statesCollection;
            if (languageCode === process.env.MEXICOLANGUAGECODE) {
                statesCollection = process.env.MEXICOSTATESFIELDCOLLECTION;
            } else if (languageCode === process.env.UNITEDSTATESLANGUAGECODE) {
                statesCollection = process.env.UNITEDSATTESSTATESFIELDCOLLECTION;
            } else {
                return res.status(400).json({ message: 'Unsupported language code' });
            }

            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.STATESSUBCOLLECTION).get();
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'States configuration not found' });
            }

            const statesData = snapshot.data();
            const states = statesData[statesCollection];

            if (!states || !Array.isArray(states)) {
                return res.status(500).json({ message: 'States data not found or invalid format' });
            }

            return res.status(200).json({ data: states });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves familiar members based on the provided family code.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the familiar members data.
     * @throws {Error} If an unexpected error occurs.
     */
    async getFamiliarMembers(req, res) {
        try {
            const familyCode = req.body.languageCode;
            if (!familyCode) {
                return res.status(400).json({ message: 'Missing family code in the request body' });
            }

            let familyCollection;
            if (familyCode === process.env.MEXICOLANGUAGECODE) {
                familyCollection = process.env.FAMILYMEMBERMEXICO;
            } else if (familyCode === process.env.UNITEDSTATESLANGUAGECODE) {
                familyCollection = process.env.FAMILYMEMBERSUNITEDSTATES;
            } else {
                return res.status(400).json({ message: 'Unsupported family code' });
            }

            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.FAMILIARCOLLECTION).get();
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Family members configuration not found' });
            }

            const familyData = snapshot.data();
            const family = familyData[familyCollection];

            if (!family || !Array.isArray(family)) {
                return res.status(500).json({ message: 'Family members data not found or invalid format' });
            }

            return res.status(200).json({ data: family });
        } catch(error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    /**
     * Retrieves contact types based on the provided contact code.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the contact types data.
     * @throws {Object} The response object with an error message if an unexpected error occurs.
     */
    async getContactsTypes(req, res) {
        try {
            const contactCode = req.body.languageCode;
            if (!contactCode) {
                return res.status(400).json({ message: 'Missing contact code in the request body' });
            }
    
            let contactCollection;
            
            if (contactCode === process.env.MEXICOLANGUAGECODE) {
                contactCollection = process.env.CONTACTTYPESMEXICO;
            } else if (contactCode === process.env.UNITEDSTATESLANGUAGECODE) {
                contactCollection = process.env.CONTACTTYPESUNITEDSTATES;
            } else {
                return res.status(400).json({ message: 'Unsupported contact code' });
            }
    
            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.CONTACTSTYPESSUBCOLLECTION).get();
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Contacts types configuration not found' });
            }
    
            const contactData = snapshot.data();
            const contact = contactData[contactCollection];
    
            if (!contact || !Array.isArray(contact)) {
                return res.status(500).json({ message: 'Contacts types data not found or invalid format' });
            }
    
            return res.status(200).json({ data: contact });
        } catch(error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },
    
    /**
     * Retrieves the category types based on the provided language code.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Object} The response object with the category types data.
     */
    async getCategoryTypes(req, res) {
        try {
            const { languageCode } = req.body;
    
            if (!languageCode || typeof languageCode !== 'string') {
                return res.status(400).json({ message: 'Invalid or missing language code in the request body' });
            }
            
            let categoryCollection;
            if (languageCode === process.env.UNITEDSTATESLANGUAGECODE) {
                categoryCollection = process.env.CATEGORYTYPEEN;
            } else if (languageCode === process.env.MEXICOLANGUAGECODE) {
                categoryCollection = process.env.CATEGORYTYPEES;
            } else {
                return res.status(400).json({ message: 'Unsupported language code' });
            }
    
            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION)
                                  .doc(process.env.CATEGORYTYPESSUBCOLLECTION)
                                  .get();
    
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Category types configuration not found' });
            }
    
            const categoryData = snapshot.data();
            if (!categoryData || typeof categoryData !== 'object') {
                return res.status(500).json({ message: 'Category types data not found or invalid format' });
            }
    
            if (!categoryData.hasOwnProperty(categoryCollection)) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} not found` });
            }
    
            const categoryTypes = categoryData[categoryCollection];
            if (!Array.isArray(categoryTypes)) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} is not in the correct format` });
            }
    
            return res.status(200).json({ data: categoryTypes });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    async getSpecialOcassionTypes(req, res) {
        try {
            const languageCode = req.body.languageCode;
            if (!languageCode) {
                return res.status(400).json({ message: 'Missing language code in the request body' });
            }
            
            let categoryCollection;
            if (languageCode === process.env.UNITEDSTATESLANGUAGECODE) {
                categoryCollection = process.env.SpecialOcassionEN;
            } else if (languageCode === process.env.MEXICOLANGUAGECODE) {
                categoryCollection = process.env.SpecialOcassionES;
            } else {
                return res.status(400).json({ message: 'Unsupported language code' });
            }

            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.GIFTSCONFIGURATIONVALUESSUBCOLLECTION).get();
    
            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION)
                                  .doc(process.env.CATEGORYTYPESSUBCOLLECTION)
                                  .get();
    
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Category types configuration not found' });
            }
    
            const categoryData = snapshot.data();
            if (!categoryData || typeof categoryData !== 'object') {
                return res.status(500).json({ message: 'Category types data not found or invalid format' });
            }
    
            if (!categoryData.hasOwnProperty(categoryCollection)) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} not found` });
            }
    
            const categoryTypes = categoryData[categoryCollection];
            if (!Array.isArray(categoryTypes)) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} is not in the correct format` });
            }
    
            return res.status(200).json({ data: categoryTypes });
        } catch(error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    async getSpecialOcassionTypes(req, res) {
        try {
            const languageCode = req.body.languageCode;
            if (!languageCode) {
                return res.status(400).json({ message: 'Missing language code in the request body' });
            }
            let categoryCollection;
            
            if (languageCode === process.env.UNITEDSTATESLANGUAGECODE) {
                categoryCollection = process.env.SpecialOcassionEN;
            } else if (languageCode === process.env.MEXICOLANGUAGECODE) {
                categoryCollection = process.env.SpecialOcassionES;
            } else {
                return res.status(400).json({ message: 'Unsupported language code' });
            }

            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.GIFTSCONFIGURATIONVALUESSUBCOLLECTION).get();
    
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Category types configuration not found' });
            }
    
            const categoryData = snapshot.data();
            if (!categoryData) {
                return res.status(500).json({ message: 'Category types data not found or invalid format' });
            }
    
            if (!categoryData.hasOwnProperty(categoryCollection)) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} not found` });
            }
    
            if (!Array.isArray(categoryData[categoryCollection])) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} is not in the correct format` });
            }
    
            const categoryTypes = categoryData[categoryCollection];
            return res.status(200).json({ data: categoryTypes });
        } catch(error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    async getSpecialOcassionTypes(req, res) {
        try {
            const languageCode = req.body.languageCode;
            if (!languageCode) {
                return res.status(400).json({ message: 'Missing language code in the request body' });
            }
            let categoryCollection;
            
            if (languageCode === process.env.UNITEDSTATESLANGUAGECODE) {
                categoryCollection = process.env.SpecialOcassionEN;
            } else if (languageCode === process.env.MEXICOLANGUAGECODE) {
                categoryCollection = process.env.SpecialOcassionES;
            } else {
                return res.status(400).json({ message: 'Unsupported language code' });
            }

            const snapshot = await db.collection(process.env.CONFIGURATIONVALUESCOLLECTION).doc(process.env.GIFTSCONFIGURATIONVALUESSUBCOLLECTION).get();
    
            if (!snapshot.exists) {
                return res.status(404).json({ message: 'Category types configuration not found' });
            }
    
            const categoryData = snapshot.data();
            if (!categoryData) {
                return res.status(500).json({ message: 'Category types data not found or invalid format' });
            }
    
            if (!categoryData.hasOwnProperty(categoryCollection)) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} not found` });
            }
    
            if (!Array.isArray(categoryData[categoryCollection])) {
                return res.status(500).json({ message: `Category types data for ${categoryCollection} is not in the correct format` });
            }
    
            const categoryTypes = categoryData[categoryCollection];
            return res.status(200).json({ data: categoryTypes });
        } catch(error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = ConfigurationValuesController;
