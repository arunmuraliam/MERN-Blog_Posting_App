var express = require('express');
var app = express();

var http=require('http')
var hbs=require('express-handlebars')
var bcrypt = require("bcrypt");
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.set('view engine','hbs')
app.set('views','./views')
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialDir:__dirname+'/views/partials/'}))

app.use(express.static('userprofileuploads'))

var user=require('./user')
var admin=require('./admin')
var topicmanager=require('./topicmanager')

app.use(cookieParser());
app.use(session({secret: "Key"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/userdashboard',user)
app.use('/adminlogin',admin)
app.use('/managerlogin',topicmanager)


mongoose.connect('mongodb://127.0.0.1/article'); //127.0.0.1  or localhost

var personSchema = mongoose.Schema({
    name: String,
    email:String,
    age: Number,
    place: String,
    password: String,
    premiumcount: Number,
    premium:Number,
    ratedusers:[String],
    image:String
 });
 var User = mongoose.model("User", personSchema);
 


// var Schema=mongoose.Schema;
// var Articletopics=mongoose.model('Articletopics', new Schema({ topic: String}), 'articletopics'); //collection name
// var topics=Articletopics.find(function(err,response){
//    if(err){
//       console.log("Topic error");
//    }else{
//       return response;
//       console.log(response);
//    }
// })

app.get('/', function(req, res){
   res.render('reg')
});

app.get('/login', function (req, res) {
   res.render('login')
})

app.post('/',async function(req,res){
   
   var personDetails=req.body;
   
   if(!personDetails.name || !personDetails.email || !personDetails.age || !personDetails.place || !personDetails.password){
       res.send("Invalid data")
   }else{
      var signupdata;
      var signupflag=0;
      var premiumcount = 0;
      var premium=0;
       const saltRounds = 10;
       const hashedPwd = await bcrypt.hash(personDetails.password, saltRounds);
       const pass=String(hashedPwd)
       
       //console.log(hashedPwd);
       console.log(pass);
       var newPerson= new User({
           name: personDetails.name,
           email:personDetails.email,
           age: personDetails.age,
           place: personDetails.place,
           password:pass,
           premiumcount:premiumcount,
           premium:premium
       })
       User.find(function(err,response){
         if(err){
            console.log("No data in db");
         }else{
            signupdata=response; 
            signupdata.filter(function(user){
               if(user.email == personDetails.email){
                  signupflag=1;
                  //console.log(signupflag);
                 // res.setHeader(404, {'Content-Type': 'text/html'});
                  //res.send("User already exists")
                  //res.status(500);
                  //res.redirect('/login');
                  
               }
            }) 
            if(signupflag == 1){
               res.send("User exists")
            }else{
               newPerson.save(function(err,User){
                  if(err){
                      //res.render('data1',{message:"Database error", type:"error"})
                      res.send("data not saved")
                  }else{
                      if(req.session.user){
                         console.log("Session already");
                         res.redirect('/userdashboard')
                      }else{
                         req.session.loggedIn = true;
                         req.session.user=newPerson;
                         console.log("session started");
                         res.redirect('/userdashboard');
                         //res.render('home',{userdata:newPerson})
                      }
                      //res.render('data1',{message:"New person added",type:"success",person:personDetails})
                      
                  }
              })
            }
         }
        
       })

       
      
       
   }
   //res.end('ok');
})

app.post('/login',async function(req,res){
   var userDetails=req.body;
   
   if(!userDetails.email || !userDetails.password){
      res.send("Invalid Data")
   }else{

      let user =await User.findOne({email:userDetails.email})
      if(user){
         let cmp = await bcrypt.compare(userDetails.password,user.password);
         if(cmp){
            console.log("login success");
            if(req.session.user){
               res.redirect('/userdashboard')
            }else{
               req.session.loggedIn = true;
               req.session.user=user;
               console.log("Session started");
               //res.render('home',{userdata:user});
               res.redirect('/userdashboard')
            }
         }else{
            console.log("Login failed");
            res.redirect('/login')
         }
      } else {
         console.log("Invalid email or user not exists");
         res.redirect("/")
      }


      // let flaglogin=false;
      // User.find(function(err,response){
      //    logindata=response;
      //    //console.log(logindata);
      //    let login
      //    logindata.filter( function(user){
      //       login=user;
      //       const cmp= bcrypt.compare(userDetails.password,user.password);
      //       if(cmp){
      //          if(user.email == userDetails.email){
      //             console.log("email varified");
      //             flaglogin=true;
      //             //console.log(flaglogin);
                  
      //          }
      //       }  
      //    });
      //    console.log(login);
      //    //console.log(flaglogin);
         
      // })

      // if(flaglogin==true){
      //    req.session.user=login;
      //    //req.session.user=userDetails;
      //    console.log("Login Session started");
      //    res.redirect('/userdashboard')
         
      // }else{
      //    res.send("User not found")
      // }
   }
   
})



app.listen(8080);