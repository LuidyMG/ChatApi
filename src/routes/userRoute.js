const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.post);
router.post('/friend/', userController.postFriend);
router.get('/friends/:token', userController.getFriends);
router.get('/userInfo/:token', userController.getUserInfo);
router.get('/users/:id', userController.getAllUsers);
router.get('/:login', userController.getLogin);
router.put('/:id', userController.put);
router.delete('/friend/remove/:tokenAndIdContact', userController.deleteFriend);

module.exports = router;