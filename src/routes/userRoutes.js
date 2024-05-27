const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');
const UtilsServerController = require('../controllers/utilsServerController');

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
router.post('/registerUser', verifyToken, UserController.registerUser);
router.post('/updateUser', verifyToken, UserController.updateUser);
router.post('/sendRequests', verifyToken, UserController.sendRequests);
router.post('/recordEmail', verifyToken, UserController.recordEmail);
router.post('/searchEmail', verifyToken, UtilsServerController.getAndSearchSpecificEmailFromEmails);
router.post('/searchPhone', verifyToken, UtilsServerController.getAndSearchSpecificPhoneFromUsers);
router.post('/searchUserName', verifyToken, UtilsServerController.getAndSearchSpecificNameFromMobileUser);
router.post('/searchSpecificUser', verifyToken, UtilsServerController.searchUser);
router.post('/searchByUID', verifyToken, UtilsServerController.searchByUID);
router.post('/postUnitedStatesStates', verifyToken, UtilsServerController.insertStates);
router.post('/msusers/me', verifyToken, UserController.getUserData);
router.post('/msusers/linkAccount', verifyToken, UtilsServerController.linkEmailAndPhoneToFirebaseAccount);

// Authentication doesn't require token verification
router.post('/unblockIP', UtilsServerController.unblockIP);
router.post('/refreshToken', UserController.refreshToken);
router.post('/verifyToken', UserController.verifyToken);

/*
* Routes for the User model DELETE
* All routes require token verification
*/
router.delete('/deleteUID', verifyToken, UserController.deleteUid);


/*
* Routes for the User model PATCH
* All routes require token verification
*/
router.patch('/updateUser', verifyToken, UserController.patchData);
router.patch('/verifyUserEmail', verifyToken, UserController.patchEmailVerification);

module.exports = router;
