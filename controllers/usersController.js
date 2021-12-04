var User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.signup_get = function (req, res) {
    res.render('users/signup', { title: 'Sign-Up' });
}

exports.signup_post = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Username length must be more than 3 symbols.')
        .bail()
        .isAlphanumeric()
        .withMessage('Username can contain only letters and numbers.')
        .bail()
        .escape()
        .custom(async function(value) {
            var existingUser = await User.exists({ username: value });
            if (existingUser === true) return Promise.reject();
            else return Promise.resolve();
        })
        .withMessage('Username is already taken.'),

    body('password')
        .isLength({ min: 3, max: 100 })
        .withMessage('Password length must be more than 3 symbols.')
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
        .withMessage('Passwords must match.'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // got some errors, rerender sign up page with error messages
            res.render('users/signup', { title: 'Sign-Up', errors: errors.array(), username: req.body.username });
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
                    res.redirect('/');
                });
            });
        }
    }
];

exports.login_get = function (req, res) {
    res.render('users/login', { title: 'Log-in' });
}
