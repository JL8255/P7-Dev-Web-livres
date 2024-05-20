const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Récupération du token en le séparant du "Bearer" dans l'en-tête.
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); // Fonction de vérification de validité du token
        const userId = decodedToken.userId; // Extraction de l'id utilisateur à partir du token décodé
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};