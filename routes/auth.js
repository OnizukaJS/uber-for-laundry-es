const express = require('express')
const authRouter = express.Router();

const bcrypt = require('bcryptjs');
const saltRounds = 10;

const User = require('./../models/user');

//Get /signup --> renderizar el formulario de signup
authRouter.get('/signup', (req, res, next) => {
    console.log('Entra en signup');
    //Message vide mais on le créé au cas où on veut laisser un mess au user
    res.render('auth/signup.hbs', {
        errorMessage: ''
    })
})

//POST /signup --> recoger los datos del formulario y crear un nuevo usario en la BDD
//on rentre dans signup pour récup les données
authRouter.post('/signup', (req, res, next) => {
    //console.log('req.body:', req.body);
    const {
        name,
        email,
        password
    } = req.body;

    //Vérifier que les champs email y pass ne sont pas vides
    if (email === "" || password === "") {
        res.render('auth/signup', {
            errorMessage: "Enter both email and password "
        });
        return;
    }
    //Vérifier que le user n'existe pas déjà, on cherche les emails dans la BDD
    User.findOne({
            email
        })
        //On fait un promise avec then/catch
        .then((foundUser) => {
            if (foundUser) {
                res.render('auth/signup', {
                    errorMessage: `There's already an account with the email ${email}`
                });
                return;
            }

            //Si le user n'existe pas, on encrypte le pass
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(password, salt);

            //Garder le user dans la BDD
            const newUser = {
                name,
                email,
                password: hashedPassword
            };

            User.create({
                    name,
                    email,
                    password: hashedPassword
                })
                .then(() => {
                    res.redirect('/login');
                })
                .catch((err) => {
                    res.render('auth/signup', {
                        errorMessage: "Error while creating account. Please try again."
                    })
                });
        })
        .catch((err) => console.log(err));
})



module.exports = authRouter;