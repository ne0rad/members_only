var express = require('express');
var router = express.Router();
var passport = require('passport');

var usersController = require('../controllers/usersController');

// Redirect to home page if already logged-in
router.use(['/signup', '/login'], function(req, res, next){
    if(req.user) res.redirect('/')
    else next();
})

router.get('/signup', usersController.signup_get);
router.post('/signup', usersController.signup_post);

router.get('/login', usersController.login_get);

router.post('/login', function (req, res, next) {
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
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
