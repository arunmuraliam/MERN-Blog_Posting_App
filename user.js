var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

const url = require('url')

const { Article } = require('./models/articleSchema');
const { Userlist } = require('./models/userSchema')


mongoose.connect('mongodb://127.0.0.1/article'); //127.0.0.1  or localhost
var bodyParser = require('body-parser');

const multer = require('multer')
var fs = require('fs');
const path = require('path');
const md5 = require('md5');

const { response } = require('express');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Schema = mongoose.Schema;
var Articletopic = mongoose.model('Articletopic', new Schema({ topic: String }), 'articletopics'); //collection name



router.use(function (req, res, next) {
   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
   next();
});

router.get('/', async function (req, res) {
   try {


      if (req.session.user) {
         var userdata = req.session.user;
         console.log(userdata);
         //console.log(userdata.name);

         // Listing Articles
         var publishedarticles;
         var displayarticle = new Array();
         var loginuser = req.session.user;
         var userid = loginuser._id;
         await Article.find({ approved: 1, rejected: 0 }, (err, response) => {
            if (!err) {
               var approvedarticles = response
               publishedarticles = approvedarticles.filter(function (articles) {
                  if (articles.userid != userid) {
                     //res.json(articles);
                     return articles;
                  }
               })
               //res.json(response);
               console.log(publishedarticles);
            }
         }).clone()
         console.log(publishedarticles.length);
         //console.log(publishedarticles[0].userid);

         let dataofuser;
         for (var i = 0; i < publishedarticles.length; i++) {
            console.log(publishedarticles[i].userid);
            var useri = publishedarticles[i].userid;

            try {
               dataofuser = await Userlist.find({ _id: publishedarticles[i].userid }).lean().clone()
            } catch (error) {
               console.log("User find Error");
            }
            // await Userlist.find({_id:useri},async (err,response) => {

            //    if(!err){
            //       //res.json(response)
            //       username=await response[i].name;
            //       console.log(response[i].name);
            //      //console.log(response);
            //       email =await response[i].email;

            //       //console.log(response[i].email);
            //    }
            // }).lean().clone()

            console.log(dataofuser);
            console.log(dataofuser[0].ratedusers);

            var articleid = await publishedarticles[i]._id;
            var title = await publishedarticles[i].title;
            var description = await publishedarticles[i].description;
            var content = await publishedarticles[i].content;
            var likeCount = await publishedarticles[i].likes.length;

            var articleuserid = dataofuser[0]._id;
            var username = dataofuser[0].name;
            var email = dataofuser[0].email;
            var premiumcount = dataofuser[0].premiumcount;
            var premium = dataofuser[0].premium;
            var ratedusers = dataofuser[0].ratedusers;
            var image = dataofuser[0].image;

            var articledata = {
               articleuserid: articleuserid,
               username: username,
               email: email,
               premiumcount: premiumcount,
               premium: premium,
               ratedusers: ratedusers,
               image: image,
               articleid: articleid,
               title: title,
               description: description,
               content: content,
               likeCount: likeCount
            }

            displayarticle[i] = articledata;
         }

         console.log("Articles");
         console.log(displayarticle);
         res.render('home', { userdata: userdata, displayarticle: displayarticle });
      } else {
         res.redirect('/login')
      }
   } catch (error) {
      console.log(error);
   }

});


router.post('/', async (req, res) => {
   var data = req.body;
   console.log(data);
   var articleuserid = data.articleuserid
   var loginuserid = data.loginuserid;
   console.log(loginuserid);
   var rateduserlist;
   //let flag =0;
   if (data.premiumcount == 10) {
      await Userlist.find({ _id: articleuserid }, function (err, response) {
         //console.log(response);
         var ratedusers = response[0].ratedusers;
         console.log(ratedusers);
         if (!err) {
            rateduserlist = ratedusers.filter((rateduser) => {
               if (rateduser == loginuserid) {
                  console.log("Second log" + rateduser);
                  //flag =1;
                  return rateduser;
               }
            })
            console.log("rateduserlist" + rateduserlist);
            //!rateduserlist || !ratedusers[0]
            if (!rateduserlist[0] || !ratedusers[0]) {
               Userlist.findByIdAndUpdate(articleuserid, { $set: { premiumcount: data.premiumcount, premium: 1 }, $addToSet: { ratedusers: { $each: [loginuserid] } } }, { upsert: true, new: true }, function (err, response) {
                  if (err) {
                     console.log("Rating Error");
                  } else {
                     console.log("Rating Success");
                     console.log(response);
                  }
               }).clone()

            }
         }
      }).clone()
   } else {
      // { $contains : "sushi" }
      await Userlist.find({ _id: articleuserid }, function (err, response) {
         //console.log(response);
         var ratedusers = response[0].ratedusers;
         console.log(ratedusers);
         if (!err) {
            rateduserlist = ratedusers.filter((rateduser) => {
               if (rateduser == loginuserid) {
                  console.log("Second log" + rateduser);
                  //flag =1;
                  return rateduser;
               }
            })
            console.log("rateduserlist" + rateduserlist);
            //!rateduserlist || !ratedusers[0]
            if (!rateduserlist[0] || !ratedusers[0]) {
               Userlist.findByIdAndUpdate(articleuserid, { $set: { premiumcount: data.premiumcount }, $addToSet: { ratedusers: { $each: [loginuserid] } } }, { upsert: true, new: true }, function (err, response) {
                  if (err) {
                     console.log("Rating Error");
                  } else {
                     console.log("Rating Success");
                     console.log(response);
                  }
               }).clone()

            }
         }
      }).clone()


   }


})


// const address=req.url;
// let urlObject = url.parse(address,true);


router.get('/logout', function (req, res) {
   req.session.destroy(function () {
      console.log("User Logout");
   })
   res.redirect('/login');

})

router.get('/postblog', function (req, res) {
   if (req.session.user) {

      Articletopic.find(function (err, response) {
         if (err) {
            console.log("Topic error");
         } else {

            //console.log(response);
            //return response;
            res.render('blogreg', { topics: response });
         }
      }).lean()
      //var userdata=req.session.user;
      //console.log(userdata);

   } else {
      res.redirect('/login')
   }
})
router.post('/postblog', function (req, res) {
   var loginuser = req.session.user;
   var userid = loginuser._id;
   console.log(loginuser);
   console.log(userid);
   blogdetails = req.body;
   var date = Date.now();
   var approved = 0;
   var rejected = 0

   const newRequest = new Article({
      topic: blogdetails.topic,
      title: blogdetails.title,
      description: blogdetails.description,
      content: blogdetails.content,
      date: date,
      approved: approved,
      rejected: rejected,
      userid: userid
   })
   newRequest.save(function (err, Article) {
      if (err) {
         console.log("Article submission error");

      } else {
         console.log("Article Submission success");

      }
   })
   console.log(date);
   //res.send("success")

   res.redirect('/userdashboard')
   console.log(blogdetails);
})

router.get('/pendingarticles', async (req, res) => {
   var loginuser = req.session.user;
   var userid = loginuser._id;
   await Article.find({ userid: userid, approved: 0, rejected: 0 }, (err, response) => {
      if (!err) {
         //res.json(response);
         res.render('pendingarticles', { pendingarticles: response, userdata: loginuser })
         console.log(response);
      }
   }).lean().clone()
})
router.get('/rejectedarticles', async (req, res) => {
   var loginuser = req.session.user;
   var userid = loginuser._id;
   await Article.find({ userid: userid, approved: 0, rejected: 1 }, (err, response) => {
      if (!err) {
         //res.json(response);
         res.render('rejectedarticles', { rejectedarticles: response, userdata: loginuser })
         console.log(response);
      }
   }).lean().clone()
})
router.get('/approvedarticles', async (req, res) => {
   var loginuser = req.session.user;
   var userid = loginuser._id;
   await Article.find({ userid: userid, approved: 1, rejected: 0 }, (err, response) => {
      if (!err) {
         //res.json(response);
         res.render('approvedarticles', { approvedarticles: response, userdata: loginuser })
         console.log(response);
      }
   }).lean().clone()
})

router.get('/publishedarticles', async (req, res) => {
   var loginuser = req.session.user;
   var userid = loginuser._id;
   await Article.find({ approved: 1, rejected: 0 }, (err, response) => {
      if (!err) {
         var approvedarticles = response
         var publishedarticles = approvedarticles.filter(function (articles) {
            if (articles.userid != userid) {
               res.json(articles);
               return articles;
            }
         })
         //res.json(response);
         console.log(publishedarticles);
      } else {
         res.send("NO data")
      }
   }).clone()
})


router.get('/userprofile', (req, res) => {
   if (req.session.user) {
      var loginuser = req.session.user;
      res.render('userprofile', { userdata: loginuser })
   }
})

const storage = multer.diskStorage({
   destination: (req, files, cb) => {
      cb(null, './userprofileuploads')
   },
   filename: (req, file, cb) => {
      cb(null, md5(Date.now() + Math.random()) + path.extname(file.originalname))
   }
})

const upload = multer({ storage: storage })

router.post('/userprofile', upload.single('image'), async (req, res) => {
   var loginuser = req.session.user;
   var imagedata = req.file;
   //console.log(imagedata);

   const image = {
      data: fs.readFileSync("userprofileuploads/" + req.file.filename),
      contentType: "image/jpg"
   }

   //console.log(image);

   await Userlist.findByIdAndUpdate({ _id: loginuser._id }, { $set: { image: req.file.filename } }, { new: true }, function (err, response) {
      if (err) {
         console.log("Error");
      } else {
         console.log("Updated");
      }
   }).clone()
   res.redirect('/userdashboard');
   //res.json({ file: imagedata })
})

router.post('/likecount', (req, res) => {
   console.log(req.body);
   var articleid = req.body.articleid;
   console.log("#########"+articleid);
   res.json({id:articleid})
})
router.post('/like', async (req, res) => {
   console.log(req.body);
   var likeDetails = req.body;
   var loginuserid = likeDetails.loginuserid;
   var articleid = likeDetails.articleid;
   console.log(loginuserid);
   var userPremium;
   await Userlist.find({ _id: likeDetails.loginuserid }, (err, response) => {
      if (!err) {
         console.log(response[0]);
         userPremium = response[0].premium;
      }
   }).clone()
   console.log(userPremium);
   if (userPremium == 1) {
      await Article.findByIdAndUpdate(articleid, { $addToSet: { likes: { $each: [loginuserid] } } }, { upsert: true, new: true }, function (err, response) {
         if (!err) {
            console.log("Like Added");
         }
      }).clone()
   } else {
      res.json({ status : false , message: "you are not a premium user" });
   }

})

module.exports = router;