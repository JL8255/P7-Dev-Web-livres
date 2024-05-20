const express = require('express');
const app = express();
const mongoose = require('mongoose');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const path = require('path');

//mongoose.connect(process.env.DATABASE, --> Avec l'utilisation d'une variable d'environnement 'DATABASE' lors de la mise en production avec le l'id et le mdp de la BD définitive
mongoose.connect('mongodb+srv://appP7:appP7@clusteroc.v0ajq8e.mongodb.net/P7?retryWrites=true&w=majority&appName=ClusterOC', // BD test

  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/images_uploaded', express.static(path.join(__dirname, 'images_uploaded')));
app.use('/images_temp', express.static(path.join(__dirname, 'images_temp')));
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;