var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    message: { type: String, required: true, minlength: 1, maxlength: 1000 },
    date: { type: Date, required: true }
});

PostSchema.virtual('delete_url')
    .get(function () {
        return 'delete/' + this._id;
    });

module.exports = mongoose.model('Post', PostSchema, 'posts');
