const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer.config')

// insertion de l'authentification 'auth' et de multer sur toutes les routes qui le nécessitent
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestrating);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.post('/:id/rating', auth, bookCtrl.rateABook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;