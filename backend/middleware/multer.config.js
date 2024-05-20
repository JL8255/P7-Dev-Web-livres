const multer = require('multer');

const MIME_TYPES = { // format pris en charge
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.diskStorage({ // stockage des images en local <> memoryStorage = Buffer
  destination: (req, file, callback) => {
    callback(null, 'images_temp');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.slice(0, (file.originalname.length) - 4).split(' ').join('_'); // Nom du fichier d'origine népuré : espaces remplacés par _ et suppression de l'extention
    const extension = MIME_TYPES[file.mimetype]; // Sélection de l'extention par rapport à la liste des MIME TYPES déclarés
    callback(null, name + Date.now() + '.' + extension); // Création du nouveau nom de fichier : racine + date + .extention
  }
});

module.exports = multer({ storage: storage }).single('image');