var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

// Routes which need user to be logged-in
router.use(['/member', '/new'], indexController.require_user);

// Routes where user not allowed if already logged-in
router.use(['/signup', '/login'], indexController.user_not_allowed);

router.get('/', indexController.index_get);
router.get('/signup', indexController.signup_get);
router.post('/signup', indexController.signup_post);
router.get('/login', indexController.login_get);
router.post('/login', indexController.login_post);
router.get('/logout', indexController.logout_get);
router.get('/member', indexController.member_get);
router.post('/member', indexController.member_post);
router.get('/about', indexController.about_get);
router.post('/new', indexController.new_post);

module.exports = router;
