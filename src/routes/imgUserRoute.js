const express = require('express');
const router = express.Router();
const imgUserController = require('../controllers/imgUserController');

router.post('/', imgUserController.post);
router.get('/:token', imgUserController.get);
/*router.get('/:login', imgUserController.getLogin);
router.put('/:id', imgUserController.put);
router.delete('/:id', imgUserController.delete);*/

module.exports = router;