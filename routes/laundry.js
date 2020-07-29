var express = require('express');
const User = require('../models/user');
const LaundryPickup = require('../models/laundry-pickup');
var router = express.Router();

//Toutes les pages de "Laundry" sont accessibles même sans être loggedIn du coup on ajoute ce Middleware avant toutes les routes. Si le user n'ext pas loggedIn, il est redirigé vers "Login"
router.use((req, res, next) => {
    if (req.session.currentUser) {
        next();
        return;
    }
    res.redirect('/login');
})

/* GET laundry page. */
//La route /dashboard renderise la vue views/laundry/dashboard.hbs. 
router.get('/dashboard', (req, res, next) => {
    let query;

    //Change la consulta en fonction de si on est un lavador ou non. 
    //Si l'utilisateur est un laveur de vêtements, on cherche "recoger ropa para lavar". Sinon, on affiche "recogidas de ropa".
    if (req.session.currentUser.isLaunderer) {
        query = {
            launderer: req.session.currentUser._id
        };
    } else {
        query = {
            user: req.session.currentUser._id
        };
    }

    //Appel de plusieurs méthodes Mongoose afin de faire une consultation plus compliquée qui se finalise par exec() pour fournir notre callback
    LaundryPickup
        .find(query)
        //Lignes 36-37: Étant donné que les propriétés utilisateur et launderer sont des références à d'autres documents, nous demandons que ces références soient préremplies avec la propriété Nom du modèle utilisateur.
        .populate('user', 'name')
        .populate('launderer', 'name')
        //Trier par date de collecte dans l'ordre croissant
        .sort('pickupDate')
        .exec((err, pickupDocs) => {
            if (err) {
                next(err);
                return;
            }

            //Renderise la page views/laundry/dashboard
            res.render('laundry/dashboard.hbs', {
                //On passe le résultat de la consultation (pickupDocs) dans la variable locale pickups
                pickups: pickupDocs
            });
        });
});

//Cette page contient un formulaire que le user enverra pour devenir un lavandero.
//En d'autres termes, ce form s'enverra qui une route POST qui actualisera les infos du user dans la BDD
router.post('/launderers', (req, res, next) => {
    //Pour obtenir l'ID du user de cette session
    const userId = req.session.currentUser._id;
    const laundererInfo = {
        //Ce qu'on va aller chercher dans le form
        fee: req.body.fee,
        isLaunderer: true
    };

    //Methode findByIdAndUpdate de Mongoose
    User.findByIdAndUpdate(userId, laundererInfo, {
        new: true
    }, (err, theUser) => {
        if (err) {
            next(err);
            return;
        }

        //Actualise l'information du user dans la sesión. Ceci fonctionne grâce à l'option { new: true } afin d'obtenir l'info actualisée du user dans le callback
        req.session.currentUser = theUser;

        res.redirect('/dashboard');
    });
});

router.get('/launderers', (req, res, next) => {
    //On recherche les utilisateurs avec l'option "isLaunderer: true"
    User.find({
        isLaunderer: true
    }, (err, launderersList) => {
        if (err) {
            next(err);
            return;
        }

        //Renderise la page laundry/launderers.hbs
        res.render('laundry/launderers.hbs', {
            //Passe les résultats de la consultation (launderersList) comme variable locale "launderers"
            launderers: launderersList
        });
    });
});

//On recupère l'ID en paramètre dans l'URL
router.get('/launderers/:id', (req, res, next) => {
    const laundererId = req.params.id;

    //Utilisation de la méthode findById() de Mongoose pour récupérer les détails du lavador en question
    User.findById(laundererId, (err, theUser) => {
        if (err) {
            next(err);
            return;
        }

        //Renderise la page
        res.render('laundry/launderer-profile.hbs', {
            //Passe les résultats de la consultation (theUser) comme variable locale "theLaunderer"
            theLaunderer: theUser
        });
    });
});

//Route POST une fois que le form de "launderer-profile" a été soumis pour l'envoyer à laundry-pickup.js
router.post('/laundry-pickups', (req, res, next) => {
    const pickupInfo = {
        //Info qu'on va chercher du form de "launderer-profile"
        pickupDate: req.body.pickupDate,
        //Input "hidden" du formulaire pour avoir l'ID
        launderer: req.body.laundererId,
        //Récupère de nouveau l'ID
        user: req.session.currentUser._id
    };

    const thePickup = new LaundryPickup(pickupInfo);

    //On appelle la méthode save() de Mongoose pour sauvegarder le pickup dans la BDD sous le nom laundrypickupS. Ce nom proviens du modèle LaundryPickup et la BDD créée automatiquement le nom de la collection laundrypickups (modèle = 1ère lettre en maj. et au singulier | collection = toujours en minuscule et au pluriel)
    thePickup.save((err) => {
        if (err) {
            next(err);
            return;
        }

        //Si tout va bien, on est redirigé.
        res.redirect('/dashboard');
    });
});

module.exports = router;