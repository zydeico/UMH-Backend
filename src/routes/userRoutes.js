const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');
const UtilsServerController = require('../controllers/utilsServerController');
const FamiliarController = require('../controllers/familiarController');

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
router.post('/msusers/me', verifyToken, UserController.sendMEData);
router.post('/msusers/linkAccount', verifyToken, UtilsServerController.linkEmailAndPhoneToFirebaseAccount);
router.post('/msusers/retrieve_familiar_information', verifyToken, FamiliarController.getRegisteredFamily);
router.post('/msusers/add_familiar', verifyToken, FamiliarController.addFamilyMember);

// Authentication doesn't require token verification
router.post('/unblockIP', UtilsServerController.unblockIP);
router.post('/verifyToken', UserController.verifyToken);

/*
* Routes for the User model DELETE
* All routes require token verification
*/
router.delete('/deleteUID', verifyToken, UserController.deleteUid);
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
router.patch('/msusers/update_profile_user', verifyToken, UserController.patchData);
router.patch('/msusers/verify_user_email', verifyToken, UserController.patchEmailVerification);

module.exports = router;
