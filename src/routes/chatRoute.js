const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:idsChat', chatController.get);
router.post('/', chatController.post);

module.exports = router;