var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
//mongoose.connect('mongodb://127.0.0.1/article'); //127.0.0.1  or localhost
var adminSchema = mongoose.Schema({
    email: String,
    password: String
 });
 var Admin = mongoose.model("admin", adminSchema);

 var Schema=mongoose.Schema;
 var Articletopics=mongoose.model('Articletopics', new Schema({ topic: String}), 'articletopics'); //collection name

 const {Manager} = require('./models/managerSchema')

router.use(function(req, res, next) {
   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
   next();
});

router.get('/',function(req,res){
    res.render('login')
})

router.get('/adminhome',function(req,res){
   if(req.session.user){
      res.render('adminhome')
   }
})

router.post('/',function(req,res){
    var adminDetails=req.body;
   var flaglogin=0;
   if(!adminDetails.email || !adminDetails.password){
      res.send("Invalid Data")
   }else{
    Admin.find(function(err,response){
        admindata=response;
        console.log(admindata);
        const login=admindata.filter(function(user){
           
              if(user.email == adminDetails.email && user.password == adminDetails.password){
                 flaglogin=1;
                 return user;
              }
           
        });
        console.log(login);
        if(flaglogin==0){
           res.send("User not found")
        }else{
           req.session.user=login;
           req.session.user=adminDetails;
           console.log("Admin Login Session started");
           res.redirect('/adminlogin/adminhome')
        }
     })
   }

    //res.render('adminhome')
})

router.get('/managerreg',function(req,res){
   if(req.session.user){
      Articletopics.find(function(err,response){
         if(err){
            console.log(" Topics not in managerreg");
         }else{
            
            res.render('managerreg',{topics:response})
         }
      })
      
   }else{
      res.redirect('/adminlogin')
   }
})

router.post('/managerreg',function(req,res){
   var managerDetails=req.body;
   var password = managerDetails.phone;
   var date=Date.now();

   var managerData= new Manager({
      topic:managerDetails.topic,
      name:managerDetails.name,
      email:managerDetails.email,
      address:managerDetails.address,
      phone:managerDetails.phone,
      password:password,
      date:date
   })
   managerData.save(function(err,Manager){
      if(err){
         console.log("Manager not registered");
      }else{
         res.redirect('/adminlogin/managerreg')
         console.log("Manager registered");
      }
   })

   //console.log(managerData);
   
})


router.get('/viewmanager',function(req,res){
   
   Manager.find(function(err,response){
      var topicid =[];
      var topicname=[];
      for(var i=0;i<response.length;i++){
         
          topicid[i]=response[i].topic;
          
      }
      console.log(topicid);
      /////////
      var top=[];
      for(var j=0;j<topicid.length;j++){
         
         
         Articletopics.findOne({_id:topicid[j]},function(err,response){
           if(err){
               console.log("Error");
           }else{
            //console.log(j);
               top[j]=response;
               //console.log(response);
           }
         })
          
         
      }
      //console.log(top); 
      //console.log(topicname);
      /////////
    
      if(err){
         console.log("No managers");
      }else{
         res.render('managerlist',{managerlist:response})
      }
   })
   
})

module.exports = router;