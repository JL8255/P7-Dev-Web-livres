const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => { // Création d'un livre dans la BD
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId, // Récupère l'id de l'authentification
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.modifyBook = (req, res, next) => { // MAJ d'un livre de la BD
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => { // Efface un livre de la BD
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
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
            books.sort((a, b) => b.averageRating - a.averageRating);
            const bestRatedBooks = books.slice(0, 3);
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
    Book.findByIdAndUpdate({ _id: req.params.id })
        .then(book => {
            if (book.ratings.find(rating => rating.userId === req.auth.userId)) {
                res.status(401).json({ message: 'Not authorized' })
            } else {
                book.ratings.push({
                    userId: req.auth.userId,
                    grade: req.body.rating
                })
                res.status(200).json(book)
            }
            let newAverage = Math.round(book.ratings.reduce((accumulator, currentValue) => accumulator + currentValue.grade, 0) * 10 / book.ratings.length) / 10;
            book.averageRating = newAverage;
            return book.save();
        })
        .catch(error => res.status(400).json({ error }));
};