exports.index = function(req, res) {
    res.render('board', {title: 'Message Board', user: req.user});
}
