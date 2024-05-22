const Book = require('../models/book');
const fs = require('fs');
const sharp = require('sharp');

exports.createBook = async (req, res, next) => { // Création d'un livre dans la BD
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._userId;

    // Le chemin du fichier sur le disque
    const filepath = req.file.path;
    const outPut = "/images_uploaded/" + req.file.filename.slice(0, (req.file.filename).length - 4) + "_compressed.jpg"

    // Traitement de l'image avec Sharp
    sharp.cache(false)
    await sharp(filepath)
        .resize(405, null)  // redimensionnement
        .toFormat('jpeg')  // conversion en webp
        .jpeg({ quality: 80 })  // définition de la qualité
        .toFile('.' + outPut)  // sauvegarde du fichier traité

    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // Récupère l'id de l'authentification
        imageUrl: `${req.protocol}://${req.get('host')}${outPut}`
    });
    book.save()
        .then(() => { res.status(201).json(book) })
        .catch(error => { res.status(400).json({ error }) })

    fs.unlink(`${filepath}`, (error) => {
        if (error) { console.log('Une erreur s\'est produite lors de la suppression de l\'image temporaire!', error) }
    })
};

exports.modifyBook = async (req, res, next) => { // MAJ d'un livre de la BD

    let outPut = ""

    if (req.file != undefined) {
        const filepath = req.file.path;
        outPut = "/images_uploaded/" + req.file.filename.slice(0, (req.file.filename).length - 4) + "_compressed.jpg"

        // Traitement de l'image avec Sharp
        sharp.cache(false)
        await sharp(filepath)
            .resize(206, null)  // redimensionnement
            .toFormat('jpeg')  // conversion en webp
            .jpeg({ quality: 80 })  // définition de la qualité
            .toFile('.' + outPut)  // sauvegarde du fichier traité

        fs.unlink(`${filepath}`, (error) => {
            if (error) { console.log('Une erreur s\'est produite lors de la suppression de l\'image temporaire!', error) }
        })
    }

    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}${outPut}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id }) // Recheche du book à "écraser" dans la BD
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id }) // Mise à jour
                    .then(() => res.status(200).json(book))
                    .catch(error => res.status(401).json({ error }));
                const filename = book.imageUrl.split('/images_uploaded/')[1];
                fs.unlink(`images_uploaded/${filename}`, (error) => { // Suppression de l'image remplacée
                    if (error) { console.log('Une erreur s\'est produite lors de la suppression de l\'image temporaire!', error) }
                })
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => { // Efface un livre de la BD
    Book.findOne({ _id: req.params.id })  // Recherche du book dans la BD
        .then(book => {
            if (book.userId != req.auth.userId) { // Vérification de l'authentification
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images_uploaded/')[1];
                console.log(`images_uploaded/${filename}`)
                fs.unlink(`images_uploaded/${filename}`, () => { // Suppression du book
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Livre supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getOneBook = (req, res, next) => {  // Renvoie le livre avec l’_id fourni.
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getBestrating = (req, res, next) => { // Renvoie les 3 livres les ayant la meilleure note moyenne
    Book.find()
        .then(books => {
            books.sort((a, b) => b.averageRating - a.averageRating); // Créé une liste ordonnée (décroissante) des books
            const bestRatedBooks = books.slice(0, 3); // On stocke que les 3 premiers
            res.status(200).json(bestRatedBooks)
        })
        .catch(error => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {  // Renvoie un tableau de tous les livres de la base de données.
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.rateABook = (req, res, next) => {  // Donne une note à un livre
    Book.findByIdAndUpdate({ _id: req.params.id }) // Recherche du book à noter dans la BD
        .then(book => {
            if (book.ratings.find(rating => rating.userId === req.auth.userId)) { // Vérifie si l'id utilisateur est déjà présente dans la liste des notations
                res.status(401).json({ message: 'Not authorized' }) // Si oui --> Pas d'authorisation
            } else {
                book.ratings.push({ // Sinon push de la note dans le tableau des notes
                    userId: req.auth.userId,
                    grade: req.body.rating
                })
                res.status(200).json(book)
            }
            // Mise à jour de la note moyenne arrondie au dixième (A voir avec le front la gestion du calcul de la note affichée et à stocker)
            let newAverage = Math.round(book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0) * 10 / book.ratings.length) / 10;
            book.averageRating = newAverage;
            return book.save();
        })
        .catch(error => res.status(400).json({ error }));
};