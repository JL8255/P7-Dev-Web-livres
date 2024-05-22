const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => { // 1. Ajout de l'utilisateur à la base de donnée avec hachage du mdp.
    bcrypt.hash(req.body.password, 10) // hashage du mpd
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => { // Vérification des informations d'authentification de l'utilisateur
    User.findOne({ email: req.body.email }) // Recherche de l'utilisateur dans la BD
        .then(user => {
            if (!user) { // Si pas trouvé
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password) // Comparaison de l'origine des deux mdp hashés
                .then(valid => {
                    if (!valid) { // Si pas de correspondance
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id, // Renvoie l'_id de l'utilisateur depuis la BD
                        token: jwt.sign(  // Renvoie un token web JSON signé contenant l'_id et une durée d'expiration
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};