var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, required: true, minlength: 3, maxlength: 100 },
    password: { type: String, required: true, minlength: 3, maxlength: 100 }
});

UserSchema.virtual('url')
    .get(function () {
        return 'user/' + this._id;
    });

module.exports = mongoose.model('User', UserSchema, 'users');
