var User = require('../models/user');
var passport = require('passport');
const { body, validationResult } = require('express-validator');

exports.index_get = function (req, res, next) {
    res.render('index', { title: 'Members Only', user: req.user });
}

exports.login_get = function (req, res) {
    res.render('login', { title: 'Log-In' });
}

exports.login_post = function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) return next(err);
        if (!user) return res.render('login', {
            title: 'Log-In',
            username: req.body.username,
            errors: [{ msg: 'Invalid username/password combination' }]
        });
        req.login(user, function (err) {
            if (err) return next(err);
            return res.redirect('/');
        })
    })(req, res, next);
}

exports.logout_get = function (req, res) {
    req.logout();
    res.redirect('/');
}

exports.signup_get = function (req, res) {
    res.render('signup', { title: 'Sign-Up' });
}

exports.signup_post = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Username length must be 3 symbols or more.')
        .bail()
        .isAlphanumeric()
        .withMessage('Username can only contain letters and numbers.')
        .bail()
        .escape()
        .custom(async function (value) {
            var existingUser = await User.exists({ username: value });
            if (existingUser === true) return Promise.reject();
            else return Promise.resolve();
        })
        .withMessage('Username is already taken.'),

    body('password')
        .isLength({ min: 3, max: 100 })
        .withMessage('Password length must be 3 symbols or more.')
        .escape(),

    body('confirmpassword')
        .notEmpty()
        .withMessage('Confirm password field can\'t be empty.')
        .bail()
        .escape()
        .custom((value, { req }) => {
            if (value === req.body.password) return true;
            else return false;
        })
        .withMessage('Password confirmation doesn\'t match.'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // got some errors, rerender sign up page with error messages
            res.render('signup', { title: 'Sign-Up', errors: errors.array(), username: req.body.username });
        } else {
            // all good, encrypt password and save to DB
            var bcrypt = require('bcryptjs');
            bcrypt.genSalt(10, function (err, salt) {
                if (err) return next(err);
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) return next(err);
                    var user = new User({
                        username: req.body.username,
                        password: hash
                    });
                    user.save();
                    req.login({ username: user.username, password: user.password }, function (err) {
                        if (err) { return next(err); }
                        return res.redirect('/');
                    });
                });
            });
        }
    }
];

exports.member_get = function (req, res, next) {
    res.render('member', { title: 'Membership', user: req.user });
}

exports.require_user = function (req, res, next) {
    if (!req.user) res.redirect('/');
    else next();
}

exports.user_not_allowed = function (req, res, next) {
    if (req.user) res.redirect('/')
    else next();
}
