var express = require('express');
var router = express.Router();
var passport = require('passport');

var usersController = require('../controllers/usersController');


router.get('/signup', usersController.signup_get);
router.post('/signup', usersController.signup_post);

router.get('/login', usersController.login_get);
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login'
    })
);

module.exports = router;
