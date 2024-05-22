# Mon vieux Grimoire


## Comment lancer le projet ? 

### Avec npm

dans le dossier "backend" lancer le serveur avec : `nodemon start`
puis dans le dossier racine `npm start` pour lancer le projet. 

Le projet a été testé sur node 19.

------------------

Dépendances installées dans le dossier "backend" :

- installation nodemon : npm install -g nodemon
- installation d'express : npm install express --save
- installation de mongodb : npm install mongodb
- installation de mongoose : npm install mongoose
- installation de validator : npm install mongoose-unique-validator
- installation de bcrypt : npm install bcrypt
- installation jsonwebtoken : npm install jsonwebtoken
- installation de multer : npm install multer
- installation de sharp : npm install sharp

------------------

3 comptes utilisateurs crés dans la BD et 4 livres pour les besoins de la démonstration


id : Adm@free.fr    --> Qui a créer tous les books (chroniques des années noire 1/5)
pw : Adm

id : Rom@free.fr    --> Visiteur, a noté "Chroniques des années noires" 2/5
pw : Rom

iq : Max@free.fr    --> Visiteur, a noté "Chroniques des années noires" 5/5
pw : Max

note moyenne chroniques des années noires = (1/5 + 2/5 + 5/5)/3 = 2.666667

------------------

Corrections :

Erreur d'implémentation de sharp dans le middleware modifyBook --> Debug fait : sharp fonctionnel.
Application / activation des fonctions de suppression des images temporaires avec fs.unlink.
Ajout au gitignore l'ensemble du frontend.