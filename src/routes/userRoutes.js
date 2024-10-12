const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Controllers
const UserController = require('../controllers/userController');
const UtilsServerController = require('../controllers/utilsServerController');
const FamiliarController = require('../controllers/familiarController');
const CardsController = require('../controllers/cardsController');
const ContactsController = require('../controllers/contactsController');
const FavoritesController = require('../controllers/favoritesController');
const DistributionsController = require('../controllers/distributionsController');
const GiftsController = require('../controllers/giftsController');
const NotesController = require('../controllers/notesController');
const TaskController = require('../controllers/taskController');
const LegacyController = require('../controllers/legacyController');
const ConfigurationValuesController = require('../controllers/configurationValuesController');
const StatisticsController = require('../controllers/statisticsController');
const FeaturesController = require('../controllers/featuresController');


/*
* Routes for the User model GET
* This routes are separeted by the authentication required
*/
// Authentication requires token verification
router.get('/getData', verifyToken, UserController.getAllData);

// Authentication doesn't require token verification
router.get('/newToken', UserController.generateToken);
router.get('/health', UserController.health);
router.get('/msconfigurations/get_links', verifyToken, ConfigurationValuesController.getLinks);
router.get('/mshome/get_home_banners', verifyToken, FeaturesController.fetchHomeBanners)


/*
* Routes for the User model POST
* This routes are separeted by the authentication required
*/
router.post('/insertEmails', verifyToken, UserController.insertEmails);
router.post('/msusers/register_user', verifyToken, UserController.registerUser);
router.post('/msusers/update_general_info', verifyToken, UserController.updateUser);
router.post('/sendRequests', verifyToken, UserController.sendRequests);
router.post('/recordEmail', verifyToken, UserController.recordEmail);
router.post('/searchEmail', verifyToken, UtilsServerController.getAndSearchSpecificEmailFromEmails);
router.post('/searchPhone', verifyToken, UtilsServerController.getAndSearchSpecificPhoneFromUsers);
router.post('/searchUserName', verifyToken, UtilsServerController.getAndSearchSpecificNameFromMobileUser);
router.post('/searchSpecificUser', verifyToken, UtilsServerController.searchUser);
router.post('/searchByUID', verifyToken, UtilsServerController.searchByUID);
router.post('/postUnitedStatesStates', verifyToken, UtilsServerController.insertStates);
router.post('/insert_generic_info', verifyToken, UtilsServerController.insertGenericData);
router.post('/post_familiar', verifyToken, UtilsServerController.insertFamiliars);
router.post('/msconfigurations/get_states', verifyToken, ConfigurationValuesController.getStates);
router.post('/msconfigurations/get_familiar_relationships', verifyToken, ConfigurationValuesController.getFamiliarMembers);
router.post('/msconfigurations/get_contact_types', verifyToken, ConfigurationValuesController.getContactsTypes);
router.post('/msconfigurations/get_category_types', verifyToken, ConfigurationValuesController.getCategoryTypes);
router.post('/msconfigurations/get_special_ocassion_types', verifyToken, ConfigurationValuesController.getSpecialOcassionTypes);
router.post('/mshome/new_banner', verifyToken, upload.single('file'), FeaturesController.uploadHomeBanner);

/* 
* Routes for the User model POST
* All routes require token verification
*/
// MSUsers
router.post('/msusers/me', verifyToken, UserController.sendMEData);
router.post('/msusers/linkAccount', verifyToken, UtilsServerController.linkEmailAndPhoneToFirebaseAccount);
router.post('/msusers/retrieve_familiar_information', verifyToken, FamiliarController.getRegisteredFamily);
router.post('/msusers/add_familiar', verifyToken, FamiliarController.addFamilyMember);

// MSLetters
router.post('/msletters/register_letter', verifyToken, CardsController.registerCard);
router.post('/msletters/get_letters', verifyToken, CardsController.getCards);

// MSContacts
router.post('/mscontacts/new_contact', verifyToken, ContactsController.newContact);
router.post('/mscontacts/get_contacts', verifyToken, ContactsController.getContacts);

// MSFavorites
router.post('/msfavorites/register_favorite', verifyToken, FavoritesController.registerFavorite);
router.post('/msfavorites/get_favorites', verifyToken, FavoritesController.getFavorites);

// MSDistributions
router.post('/msdistributions/register_distribution', verifyToken, DistributionsController.registerDistribution);
router.post('/msdistributions/get_distributions', verifyToken, DistributionsController.geDistribution);

// MSGifts
router.post('/msgifts/register_gift', verifyToken, GiftsController.registerNewGift);
router.post('/msgifts/get_gifts', verifyToken, GiftsController.getAllGifts);

// MSNotes
router.post('/msnotes/register_note', verifyToken, NotesController.registerNewNote);
router.post('/msnotes/get_notes', verifyToken, NotesController.getAllNotes);

// MSTasks
router.post('/mstasks/register_task', verifyToken, TaskController.registerNewTask);
router.post('/mstasks/get_tasks', verifyToken, TaskController.getAllTasks);

// MSLegacy
router.post('/mslegacy/register_legacy_contact', verifyToken, LegacyController.registerLegacyContact);
router.post('/mslegacy/get_legacy_contacts', verifyToken, LegacyController.getLegacyContacts);

// Statistics
router.post('/statistics/get_statistics', verifyToken, StatisticsController.getStatistics);

// MSUtils
router.post('/msutils/add_fields_to_users', verifyToken, UtilsServerController.addFieldToUsers);
router.post('/msutils/family_tree', verifyToken, UtilsServerController.createFamilyTreeStructure)

/*
* Routes for the User model POST
* This routes are separeted by the authentication required
*/
router.post('/unblockIP', UtilsServerController.unblockIP);
router.post('/verifyToken', UserController.verifyToken);

router.post('/msconfigurations/rename_cards', verifyToken, UserController.renameCards);
router.post('/msconfigurations/rename_mapcard_to_letter', verifyToken, UserController.renameCardsToLetters);

/*
* Routes for the User model DELETE
* All routes require token verification
*/
router.delete('/deleteUID', verifyToken, UserController.deleteUid);

// MSUsers
router.delete('/msusers/delete_familiar', verifyToken, FamiliarController.deleteFamilyMember);

// MSLetters
router.delete('/msletters/delete_letter', verifyToken, CardsController.deleteCard);

// MSContacts
router.delete('/mscontacts/delete_contact', verifyToken, ContactsController.deleteContact);

// MSFavorites
router.delete('/msfavorites/delete_favorite', verifyToken, FavoritesController.deleteFavorite);

// MSDistributions
router.delete('/msdistributions/delete_distribution', verifyToken, DistributionsController.deleteDistribution);

// MSGifts
router.delete('/msgifts/delete_gift', verifyToken, GiftsController.deleteGift);

// MSNotes
router.delete('/msnotes/delete_note', verifyToken, NotesController.deleteNote);

// MSTasks
router.delete('/mstasks/delete_task', verifyToken, TaskController.deleteTask);

// MSLegacy
router.delete('/mslegacy/delete_legacy_contact', verifyToken, LegacyController.deleteLegacyContact);

// MSHome
router.delete('/mshome/delete_home_banner', verifyToken, FeaturesController.deleteHomeBanner)


/*
* WARNING: This route will delete all users from the database
* USE WITH CAUTION
*/
//router.delete('/deleteAllUsers', verifyToken, UserController.deleteAllUsers);
//router.delete('/deleteAllAuthUsers', verifyToken, UtilsServerController.deleteAllFirebaseUsers);


/*
* Routes for the User model PATCH
* All routes require token verification
*/
// MSUsers
router.patch('/msusers/update_profile_user', verifyToken, UserController.patchData);
router.patch('/msusers/verify_user_email', verifyToken, UserController.patchEmailVerification);
router.patch('/msusers/update_familiar', verifyToken, FamiliarController.updateFamilyMember);

// MSLetters
router.patch('/msletters/update_letter', verifyToken, CardsController.updateCard);

// MSContacts
router.patch('/mscontacts/update_contact', verifyToken, ContactsController.updateContact);

// MSFavorites
router.patch('/msfavorites/update_favorite', verifyToken, FavoritesController.updateFavorite);

// MSDistributions
router.patch('/msdistributions/update_distribution', verifyToken, DistributionsController.updateDistribution);

// MSGifts
router.patch('/msgifts/update_gift', verifyToken, GiftsController.updateGift);

// MSNotes
router.patch('/msnotes/update_note', verifyToken, NotesController.updateNote);

// MSTasks
router.patch('/mstasks/update_task', verifyToken, TaskController.updateTask);

// MSLegacy
router.patch('/mslegacy/update_legacy_contact', verifyToken, LegacyController.updateLegacyContact);

module.exports = router;
