const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');
const UtilsServerController = require('../controllers/utilsServerController');
const FamiliarController = require('../controllers/familiarController');
const CardsController = require('../controllers/cardsController');
const ContactsController = require('../controllers/contactsController');
const FavoritesController = require('../controllers/favoritesController');
const DistributionsController = require('../controllers/distributionsController');


/*
* Routes for the User model GET
* This routes are separeted by the authentication required
*/
// Authentication requires token verification
router.get('/getData', verifyToken, UserController.getAllData);

// Authentication doesn't require token verification
router.get('/newToken', UserController.generateToken);
router.get('/health', UserController.health);




/*
* Routes for the User model POST
* This routes are separeted by the authentication required
*/
// Authentication requires token verification
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
router.post('/post_familiar', verifyToken, UtilsServerController.insertFamiliars);

// MSUsers
router.post('/msusers/me', verifyToken, UserController.sendMEData);
router.post('/msusers/linkAccount', verifyToken, UtilsServerController.linkEmailAndPhoneToFirebaseAccount);
router.post('/msusers/retrieve_familiar_information', verifyToken, FamiliarController.getRegisteredFamily);
router.post('/msusers/add_familiar', verifyToken, FamiliarController.addFamilyMember);

// MSCards
router.post('/mscards/register_card', verifyToken, CardsController.registerCard);
router.post('/mscards/get_cards', verifyToken, CardsController.getCards);

// MSContacts
router.post('/mscontacts/new_contact', verifyToken, ContactsController.newContact);
router.post('/mscontacts/get_contacts', verifyToken, ContactsController.getContacts);

// MSFavorites
router.post('/msfavorites/register_favorite', verifyToken, FavoritesController.registerFavorite);
router.post('/msfavorites/get_favorites', verifyToken, FavoritesController.getFavorites);

// MSDistributions
router.post('/msdistributions/register_distribution', verifyToken, DistributionsController.registerDistribution);
router.post('/msdistributions/get_distributions', verifyToken, DistributionsController.geDistribution);

// Authentication doesn't require token verification
router.post('/unblockIP', UtilsServerController.unblockIP);
router.post('/verifyToken', UserController.verifyToken);



/*
* Routes for the User model DELETE
* All routes require token verification
*/
router.delete('/deleteUID', verifyToken, UserController.deleteUid);

// MSUsers
router.delete('/msusers/delete_familiar', verifyToken, FamiliarController.deleteFamilyMember);

// MSCards
router.delete('/mscards/delete_card', verifyToken, CardsController.deleteCard);

// MSContacts
router.delete('/mscontacts/delete_contact', verifyToken, ContactsController.deleteContact);

// MSFavorites
router.delete('/msfavorites/delete_favorite', verifyToken, FavoritesController.deleteFavorite);

// MSDistributions
router.delete('/msdistributions/delete_distribution', verifyToken, DistributionsController.deleteDistribution);


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

// MSCards
router.patch('/mscards/update_card', verifyToken, CardsController.updateCard);

// MSContacts
router.patch('/mscontacts/update_contact', verifyToken, ContactsController.updateContact);

// MSFavorites
router.patch('/msfavorites/update_favorite', verifyToken, FavoritesController.updateFavorite);

// MSDistributions
router.patch('/msdistributions/update_distribution', verifyToken, DistributionsController.updateDistribution);

module.exports = router;
