const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var articleSchema = mongoose.Schema({
    topic: String,
    title:String,
    description: String,
    content: String,
    date: String,
    approved:Number,
    rejected:Number,
    userid:String,
    likes:[String],
 });
 var Article = mongoose.model("Article", articleSchema);

 var Articlelist=mongoose.model('Articlelist', new Schema({ topic: String}), 'articles'); //collection name



 module.exports = {
    Article: Article,
    Articlelist:Articlelist
  }