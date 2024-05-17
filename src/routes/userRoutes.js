const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');
const UtilsServerController = require('../controllers/utilsServerController');

/*
* Routes for the User model GET
*/
router.get('/getData', verifyToken, UserController.getAllData);
router.get('/newToken', UserController.generateToken);
router.get('/health', UserController.health);

/*
* Routes for the User model POST
*/
router.post('/insertEmails', verifyToken, UserController.insertEmails);
router.post('/registerUser', verifyToken, UserController.registerUser);
router.post('/updateUser', verifyToken, UserController.updateUser);
router.post('/refresh-token', UserController.refreshToken);
router.post('/sendRequests', verifyToken, UserController.sendRequests);
router.post('/verifyToken', UserController.verifyToken);
router.post('/recordEmail', verifyToken, UserController.recordEmail);
router.post('/searchEmail', verifyToken, UtilsServerController.getAndSearchSpecificEmailFromEmails);
router.post('/searchPhone', verifyToken, UtilsServerController.getAndSearchSpecificPhoneFromUsers);
router.post('/searchUserName', verifyToken, UtilsServerController.getAndSearchSpecificNameFromMobileUser);
router.post('/searchSpecificUser', verifyToken, UtilsServerController.searchUser);
router.post('/searchByUID', verifyToken, UtilsServerController.searchByUID);
router.post('/unblockIP', UtilsServerController.unblockIP);
router.post('/postUnitedStatesStates', verifyToken, UtilsServerController.insertStates);

/*
* Routes for the User model DELETE
*/
router.delete('/deleteUid', verifyToken, UserController.deleteUid);


/*
* Routes for the User model PATCH
*/
router.patch('/updateUser', verifyToken, UserController.patchData);
router.patch('/verifyUserEmail', verifyToken, UserController.patchEmailVerification);

module.exports = router;
