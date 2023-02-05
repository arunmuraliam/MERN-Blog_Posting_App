var mongoose = require('mongoose');

var managerSchema=mongoose.Schema({
    topic:String,
    name:String,
    email:String,
    address:String,
    phone:String,
    password:String,
    date:Number
})

var Manager=mongoose.model('Manager',managerSchema);

module.exports={
    Manager:Manager
}