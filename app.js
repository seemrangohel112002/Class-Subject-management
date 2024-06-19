const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const User = require('./models/user');
const MONGODB_URI = "mongodb://127.0.0.1:27017/class";
const errorController = require('./controllers/error');
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set("view engine", "ejs");
app.set("views ", "views");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const subjectRoutes = require("./routes/subjects");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    // res.locals.isAdmin = req.session.isAdmin;
    next();
});

app.use(flash());
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });

});

app.use("/", adminRoutes);
app.use("/", authRoutes);
app.use(authRoutes);
app.use(adminRoutes);
app.use("/", subjectRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
   
    console.log(error);
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});


mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(3000, () => {
            console.log("Listening on port 3000");
        });
    })


