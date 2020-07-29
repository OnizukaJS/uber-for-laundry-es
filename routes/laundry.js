var express = require('express');
const User = require('../models/user');
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
    res.render('laundry/dashboard.hbs')
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

module.exports = router;