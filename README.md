SpaceVoyager est une application web de réservation de voyages spatiaux.
Elle permet aux utilisateurs de créer un compte, configurer leur voyage, choisir une destination, un hébergement, des extras, puis générer un billet de vol.
Fonctionnalités principales

Authentification : inscription, connexion, déconnexion (LocalStorage)

Choix de destination (chargée depuis destinations.json)

Sélection d’hébergement (accommodations.json)

Gestion des passagers

Date de départ & durée

Extras (Spacewalk, VR Training, Photos)

Calcul automatique du prix total

Résumé dynamique

Génération d’un billet avec référence unique

Espace utilisateur pour voir les réservations

Structure du projet
index.html
booking.html
mybookings.html
login.html / register.html
script.js
destinations.json
accommodations.json

Technologies

HTML5

TailwindCSS (CDN)

JavaScript (vanilla)

FontAwesome

LocalStorage API

Utilisation

Ouvrir index.html

Créer un compte

Remplir le formulaire de réservation

Confirmer → un billet est généré

Consulter les réservations dans mybookings.html

 Stockage

Toutes les données sont sauvegardées dans LocalStorage :

Utilisateurs

Réservations

Brouillons
