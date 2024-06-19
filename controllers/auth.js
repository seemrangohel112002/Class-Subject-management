const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Class = require('../models/class'); 

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        validationErrors: [],
        oldInput: { email: '', password: '' },
        errorMessage: null
    });
};

exports.getSignup = (req, res, next) => {
    Class.find()
        .then(classes => {
            res.render('auth/signup', {
                path: '/signup',
                pageTitle: 'Signup',
                validationErrors: [],
                oldInput: { username: '', email: '', password: '', code: '', number: ''},
                errorMessage: null,
                classes: classes
            });
        })
        .catch(err => console.log(err));
};
exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const code = req.body.code;
    const number = req.body.number;
    // const classId = req.body.class; 

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return Class.find()
            .then(classes => {
                res.status(422).render('auth/signup', {
                    path: '/signup',
                    pageTitle: 'SignUp',
                    validationErrors: errors.array(),
                    oldInput: { username, email, password, code, number},
                    errorMessage: errors.array()[0].msg,
                    classes: classes
                });
            })
            .catch(err => console.log(err));
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                username: username,
                email: email,
                password: hashedPassword,
                code: code,
                number: number,
                // classId: classId 
            });
            return user.save();
        })
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
                console.log("Signed Up! " + user.username);
                res.redirect('/');
            });
        })
        .catch(err => {
            console.log(err);
            Class.find().then(classes => {
                res.status(500).render('auth/signup', {
                    path: '/signup',
                    pageTitle: 'SignUp',
                    validationErrors: [],
                    oldInput: { username, email, password, code, number },
                    errorMessage: 'Server error, please try again later.',
                    classes: classes
                });
            }).catch(err => console.log(err));
        });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            validationErrors: errors.array(),
            oldInput: { email, password },
            errorMessage: errors.array()[0].msg
        });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    validationErrors: [],
                    oldInput: { email, password },
                    errorMessage: 'Invalid email or password.'
                });
            }
            return bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log("Logged in! " + user.username);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        validationErrors: [],
                        oldInput: { email, password },
                        errorMessage: 'Invalid email or password.'
                    });
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
    });
};
