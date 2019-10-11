var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
const request = require('request');
const puppeteer = require('puppeteer');

const  passport    = require("passport");
const   LocalStrategy = require("passport-local");
const details=require('./details');
const cheerio = require('cheerio');
var Twit = require('twit');
var config = require('./details.js');

var User = require("./models/user");
var T = new Twit(config);
var item=[];
Market  = require("./models/market"),
seedDB      = require("./seed")



mongoose.connect('mongodb://localhost/projectdb');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");

var auth= false;

app.use(require("express-session")({
    secret: "Madbot welcomes you",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
  
   next();
});
app.get("/about",function(req,res){
	res.render("about");
});
app.get("/",function(req,res){
	res.render("landing");
});
app.get("/logout", function(req, res){
    req.logout();
    
    res.redirect("/");
 });
app.get("/market",function(req,res){
    Market.find({}, function(err, allmarkets){
        if(err){
            console.log(err);
        } else {
           res.render("market",{market:allmarkets});
        }
     });
});
app.get("/overview",(req,res)=>{
res.render("overview");
});
app.get("/register", function(req, res){
    res.render("register"); 
 });
 

 app.post("/register", function(req, res){
     var newUser = new User({username: req.body.username});
     User.register(newUser, req.body.password, function(err, user){
         if(err){
             
             return res.render("register");
         }
         passport.authenticate("local")(req, res, function(){
            auth=true;
            res.redirect("/market"); 
         });
     });
 });
app.get("/login",(req,res)=>{
    res.render("login");
    });
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/market",
        failureRedirect: "/login"
    }), function(req, res){

});   
app.post("/market", function(req, res){
   
    var name = req.body.name;
    var image = req.body.image;
	var desc = req.body.text1;
    tweet(desc);
    
    var newMarket = {name: name, image: image, description: desc}

    Market.create(newMarket, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
          
            res.redirect("/market");
        }
    });
});

  
app.get("/market/new", function(req, res){
   res.render("new"); 
});
//==============================================================================================
function tweet(descp){
    request('https://www.tweeplers.com/hashtags/?cc=WORLD',(error,response,html)=>{
    if (!error && response.statusCode ==200){
        const $ = cheerio.load(html);
        var tweet=descp; 

        $('.panel-body a').each((i,el)=>{
            item.push($(el).text());
            
        });
        
        for (i = 0; i < 9; i++) {
            if(tweet.length<140){
              console.log(tweet);
                tweet =  " " +tweet+ " " + item[i] ;
                console.log(tweet); 
            }
            
            else
            break;
        }
         T.post('statuses/update', { status: tweet }, tweeted);
      
        
        function tweeted(err, data, response) {
          if (err) {
            console.log(err);
          } else {
            console.log('Success: ' + data.text);
          
          }
        };

        
        (async () => {
            const browser= await puppeteer.launch({
                headless:true,
                args:[
                    '--window-size=1920,1080',
                    '--disable-notifications'
                ]
            
            })
            const page= await browser.newPage()
            page.setViewport({height:1000,width:1920})
          
               await page.goto('https://www.facebook.com/login/')
            
            
              
              await page.waitFor(()=> document.querySelectorAll('input').length)
              await page.type('[name=email]',details.username)
              await page.type('[name=pass]',details.password)
          
              await page.evaluate(()=>{
                 document.querySelector('#loginbutton').click()
              })
            
            
            await page.waitFor(5000)
            await page.evaluate(()=>{
                document.querySelector('._2md').click()
             })
            
             await page.waitFor(3000)
             await page.evaluate(()=>{
                document.querySelector('._606w').click()
             })
             sessionCookies = await page.cookies()
             await page.waitFor(10000)
             await page.evaluate(()=>{
                document.querySelector('._34nd').click()
             })
             await page.type('._5yk1',tweet)
        
           await page.waitFor(5000)
           await page.evaluate(()=>{
              document.querySelector('._4r1q').click()
           })
            await page.waitFor(5000)
            await browser.close()
        })()
    
  }});
  

}
//===============================================================================
app.get("/market/:id", function(req, res){
    
   Market.findById(req.params.id).exec(function(err, markets){
        if(err){
            console.log(err);
        } else {
            console.log(markets)
       
            res.render("show", {market:markets});
        }
    });
});
app.listen(process.env.PORT||3000,process.env.IP,function(){
	console.log("server is listening");
	});