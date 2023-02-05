var mongoose = require('mongoose');
const Schema = mongoose.Schema;
// var personSchema = mongoose.Schema({
//     name: String,
//     email:String,
//     age: Number,
//     place: String,
//     password: String
//  });


// var Userlist = mongoose.model("Users", personSchema);
var Userlist=mongoose.model('Userlist', new Schema({ 
    name: String, 
    email:String, 
    age: Number, 
    place: String,
    password: String,
     premiumcount:Number, 
     premium:Number, 
     ratedusers:[String],
     image:String
}), 'users'); //collection name

module.exports={
    Userlist:Userlist,
}