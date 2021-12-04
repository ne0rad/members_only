var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    if (req.user) {
        res.send('Logged in')
    } else {
        res.send('Logged in');
    }
});

module.exports = router;
