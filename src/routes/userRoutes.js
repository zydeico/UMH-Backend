const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');

/*
* Routes for the User model GET
*/
router.get('/getData', verifyToken, UserController.getData);
router.get('/newToken', UserController.generateToken);
router.get('/health', UserController.health);

/*
* Routes for the User model POST
*/
router.post('/insertEmails', verifyToken, UserController.insertEmails);
router.post('/registerUser', verifyToken, UserController.registerUser);
router.post('/refresh-token', UserController.refreshToken);
router.post('/sendRequests', verifyToken, UserController.sendRequests);
router.post('/verifyToken', UserController.verifyToken);
router.post('/recordEmail', verifyToken, UserController.recordEmail);

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
