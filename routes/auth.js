const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

;

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        body('email' )
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (!userDoc) {
                        return Promise.reject(
                            'This email address does not exist. Please Sign Up!'
                        );
                    }
                });
            })
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
);

router.post(
    '/signup',
    [
        body(
            'username',

        )
            .isLength({ min: 3, max: 10 })
            .isAlphanumeric()
            .trim()
            .custom((value, { req }) => {
                return User.findOne({ username: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            'This Username Is Already Taken. Please Try Another One.!'
                        );
                    }
                });
            })
        ,
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            'E-Mail exists already, please pick a different one.'
                        );
                    }
                });
            }),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters.'
        )
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);





module.exports = router;
