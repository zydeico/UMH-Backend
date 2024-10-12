require('dotenv').config();

const { storage, firestore } = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }).single('banner'); 

const FeaturesController = {
    // GET all home banners
    async fetchHomeBanners(req, res, next) {
        try {
            const bannersRef = firestore().collection('configuration_values').doc('HomeBanners').collection('banners');
            const snapshot = await bannersRef.get();
    
            if (snapshot.empty) {
                return res.status(404).json({ message: 'No banners found' });
            }
    
            const banners = {};
            snapshot.forEach(doc => {
                const bannerData = doc.data();
                const { actionURL, imageUrl, language, id } = bannerData;
    
                const baseFileName = doc.id;
    
                if (!banners[baseFileName]) {
                    banners[baseFileName] = {};
                }

                if (actionURL) {
                    banners[baseFileName].actionURL = actionURL;
                }
    
                if (language === 'EN' && imageUrl) {
                    banners[baseFileName].imageUrlEN = imageUrl;
                } else if (language === 'ES' && imageUrl) {
                    banners[baseFileName].imageUrlES = imageUrl;
                }

                banners[baseFileName].bannerId = id;
            });

            const bannersArray = Object.keys(banners).map(key => {
                const banner = banners[key];
                const filteredBanner = {};
    
                if (banner.imageUrlES) filteredBanner.imageUrlES = banner.imageUrlES;
                if (banner.imageUrlEN) filteredBanner.imageUrlEN = banner.imageUrlEN;
                if (banner.actionURL) filteredBanner.actionURL = banner.actionURL;
                if (banner.bannerId) filteredBanner.id = banner.bannerId;
    
                return filteredBanner;
            });
    
            return res.status(200).json({ message: 'Banners fetched successfully', data: bannersArray });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    // Upload new banners
    async uploadHomeBanner(req, res, next) {
        try {
            const { language, actionUrl } = req.body;

            const bannerId = uuidv4();

            if (!req.file || !['ES', 'EN'].includes(language)) {
                return res.status(400).json({ message: 'Invalid request. Please upload a file and specify a valid language (ES or EN).' });
            }
    
            const currentDate = new Date().toISOString().split('T')[0];
            const fileName = `${bannerId}_${currentDate}_${language}.png`;
    
            const bucketName = 'umhbackend.appspot.com';
            const bucket = storage().bucket(bucketName);
    
            const file = bucket.file(`public_files/Home/Banners/${fileName}`);
            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                }
            });

            const [imageUrl] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            const actionURL = actionUrl;
            const bannerData = {
                id: bannerId,
                imageUrl,
                actionURL,
                language,
                dateUploaded: new Date(),
            };
            await firestore().collection('configuration_values').doc('HomeBanners').collection('banners').doc(bannerId).set(bannerData);
            return res.status(201).json({ 
                message: 'Banner uploaded and saved successfully', 
                data: { id: bannerId, imageUrl, actionURL }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    },

    // Delete banners using their id
    async deleteHomeBanner(req, res, next) {
        try {
            const { bannerId } = req.body;
            if (!bannerId) {
                return res.status(400).json({ message: 'Invalid request. Banner ID is required.' });
            }


            const bannerDocRef = firestore().collection('configuration_values').doc('HomeBanners').collection('banners').doc(bannerId);
            const bannerDoc = await bannerDocRef.get();
    
            if (!bannerDoc.exists) {
                return res.status(404).json({ message: `Banner with ID ${bannerId} not found.` });
            }
    
            const bannerData = bannerDoc.data();
            const imageUrl = bannerData.imageUrl;

            const filePath = decodeURIComponent(imageUrl.split('/').pop().split('?')[0]);
            const bucketName = 'umhbackend.appspot.com';
            const bucket = storage().bucket(bucketName);
            const file = bucket.file(`public_files/Home/Banners/${filePath}`);
    
            await file.delete();
            await bannerDocRef.delete();
    
            return res.status(200).json({ message: 'Banner and file deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Unexpected error', error: error.message });
        }
    }
};

module.exports = FeaturesController;