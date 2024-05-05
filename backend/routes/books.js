const express = require('express');
const router = express.Router();
const stuffCtrl = require('../controllers/stuff');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer.config')

router.post('/', auth, multer, stuffCtrl.createBook);
router.put('/:id', auth, multer, stuffCtrl.modifyBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.get('/:id', auth, stuffCtrl.getOneBook);
router.get('/', auth, stuffCtrl.getAllBooks);

module.exports = router;