var User = require('../models/user');
var Post = require('../models/post');
var passport = require('passport');
var async = require('async');
const { body, validationResult } = require('express-validator');

exports.index_get = function (req, res, next) {
    if (req.user) {
        async.parallel({
            userDB: function (callback) {
                User.findOne({ username: req.user.username }, callback);
            },
            posts: function (callback) {
                Post.find({})
                    .sort({date: -1})
                    .populate('author')
                    .exec(callback);
            }
        }, function (err, results) {
            if (err) return next(err);
            res.render('index', { title: 'Members Only', user: req.user, isMember: results.userDB.isMember, posts: results.posts });
        })
    } else {
        Post.find({})
            .sort({date: -1})
            .limit(5)
            .exec(function(err, posts){
                if(err) return next(err);
                res.render('index', { title: 'Members Only', posts: posts });
            })
    }
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
                        password: hash,
                        isMember: false
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

exports.member_post = [
    body('answer')
        .isNumeric()
        .withMessage('Answer must be a number.')
        .bail()
        .escape()
        .custom(value => {
            if (value == 8) return true;
            else return false;
        })
        .withMessage('Wrong answer.'),
    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('member', { title: 'Membership', errors: errors.array(), user: req.user });
        } else {
            User.updateOne({ username: req.user.username }, { isMember: true })
                .exec(function (err) {
                    if (err) return next(err);
                    res.redirect('/');
                })
        }
    }
]

exports.about_get = function (req, res, next) {
    res.render('about', { title: 'About', user: req.user });
}

exports.new_post = [
    body('message')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message maximum length is 1000 symbols.')
        .escape(),
    function (req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            User.findOne({ username: req.user.username })
                .exec(function (err, userDB) {
                    if (err) return next(err);
                    res.render('index', { title: 'Members Only', errors: errors.array(), message: req.body.message, user: req.user, isMember: userDB.isMember });
                })
        } else {
            // Success, save post to DB
            User.findOne({ username: req.user.username })
                .exec(function (err, userDB) {
                    if (err) return next(err);
                    var post = new Post({
                        author: userDB._id,
                        message: req.body.message,
                        date: new Date()
                    });
                    post.save();
                    res.redirect('/');
                })
        }
    }
]

exports.require_user = function (req, res, next) {
    if (!req.user) res.redirect('/');
    else next();
}

exports.user_not_allowed = function (req, res, next) {
    if (req.user) res.redirect('/')
    else next();
}
