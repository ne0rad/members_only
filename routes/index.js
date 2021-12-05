var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Members Only', user: req.user });
});

module.exports = router;
