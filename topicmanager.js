var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
const { Manager } = require('./models/managerSchema');
const { Articlelist, Article } = require('./models/articleSchema')


//var approvedata = new Articlelist();
router.get('/',function(req,res){
    res.render('login')
})

router.get('/managerhome',function(req,res){
    if(req.session.user){
        console.log(req.session.user);
       res.render('managerhome')
    }
 })


router.post('/',function(req,res){
    var managerDetails=req.body;
   var flaglogin=0;
   if(!managerDetails.email || !managerDetails.password){
      res.send("Invalid Data")
   }else{
    Manager.find(async function(err,response){
        managerdata=response;
        
        //console.log(managerdata);
        const login=await managerdata.filter(function(user){
           
              if(user.email == managerDetails.email && user.password == managerDetails.password){
                 flaglogin=1;
                 return user;
              }
           
        });
        //console.log(login[0]);
        //console.log(login); returns an array
        if(flaglogin==0){
           res.send("User not found")
        }else{
           req.session.user=login[0];
           
           console.log("Manager Login Session started");
           res.redirect('/managerlogin/managerhome')
        }
     })
   }
    //res.render('adminhome')
})


router.get('/viewarticles',function(req,res){
    var topicmanager=req.session.user;
    //console.log(topicmanager.topic);
    var topicid=topicmanager.topic;
    //console.log("Topic Id"+topicid);
    if(req.session.user){
        let approveval=1;
        Articlelist.find({topic:topicid},function(err,response){
            var articlelist=response;
            if(err){
                console.log("Error in article list");
            }else{
                //console.log(articlelist);
                var nodata;
                var data = articlelist.filter(function(article){
                    if(article.approved == 0 && article.rejected == 0){
                        //console.log(article);
                        return article
                    }
                    
                })
                if(data.length === 0){
                    nodata ="No aritcles to approve"
                }

                res.render('viewarticles',{data:data,nodata:nodata})
                //console.log(data);
                
            }
            

            // if(err){
            //     console.log("Error in article list")
            // }else{
            //     //console.log(response[0]);
            //     var data=response
            //     //console.log(data);
            //     res.render('viewarticles',{data:data})
            //     //res.send(response[0])
            // }
        }).lean().clone()
        
    }else{
        res.redirect('/login')
    }
})

router.get('/articledetails/:id',function(req,res){
    var id=req.params.id;
    Articlelist.find({_id:id},function(err,response){
        if(err){
            console.log("Article list error");
        }else{
            //res.send("Article finded")
            res.render("articledetails",{articledata:response[0]})
            //console.log(response[0]);
        }
    }).lean()
})
//multiline comment remove - ctrl+k+u
router.post('/articledetails/:id',async function(req,res){
    var id=req.params.id;
    console.log("id"+id);
    
    var body=req.body;
    var app=body.approve
    var rej=body.reject
    console.log(app);
    console.log(rej);
    if(app == "Approve"){

        await Articlelist.find({_id:id},async function(err,response){
            //console.log(response);
            var articleinfo=response[0];
            
            //console.log(articleinfo._id);
            //console.log(articleinfo.approved);
            if(articleinfo.approved == 0 && articleinfo.rejected == 0){

                await Article.findByIdAndUpdate(articleinfo._id,{$set :{approved:1}},{new:true},function(err,response){
                    //console.log(response);
                    if(err){
                        console.log("Updation Error");
                    }else{
                        res.send("Approved")
                        console.log("Updated User : "+ response);
                    }
                }).lean().clone()
            }else{
                res.send("Already Updated")
                console.log("Already Updated");
            }
        }).lean().clone()
        
        
    }
    if(rej == "Reject"){
        await Articlelist.find({_id:id},async function(err,response){
            //console.log(response);
            var articleinfo=response[0];
            
            //console.log(articleinfo._id);
            //console.log(articleinfo.approved);
            if(articleinfo.approved == 0 && articleinfo.rejected == 0){

                await Article.findByIdAndUpdate(articleinfo._id,{$set :{rejected:1}},{new:true},function(err,response){
                    //console.log(response);
                    if(err){
                        console.log("Updation Error");
                    }else{
                        res.send("Rejected")
                        console.log("Rejected User : "+ response);
                    }
                }).clone()
            }else{
                res.send("Already Updated")
                console.log("Already Updated");
            }
        }).lean().clone()
    }
    

})


module.exports=router;


































