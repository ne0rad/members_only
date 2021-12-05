var express = require('express');
var router = express.Router();
var boardController = require('../controllers/boardController');


// Redirect to home page if user isn't logged in
router.use('*', function(req, res, next) {
    if(!req.user) {
        res.redirect('/');
    } else {
        next();
    }
});

router.get('/', boardController.index);

module.exports = router;
