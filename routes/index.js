var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

// Routes which need user to be logged-in
router.use(['/member'], indexController.require_user);

// Routes where user not allowed if already logged-in
router.use(['/signup', '/login'], indexController.user_not_allowed);

router.get('/', indexController.index_get);
router.get('/signup', indexController.signup_get);
router.post('/signup', indexController.signup_post);
router.get('/login', indexController.login_get);
router.post('/login', indexController.login_post);
router.get('/logout', indexController.logout_get);
router.get('/member', indexController.member_get);

module.exports = router;
