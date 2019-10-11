var mongoose = require("mongoose");
var market = require("./models/market");
function seedDB(){
   
    market.deleteMany({}, function(err){
         if(err){
             console.log(err);
         }
         console.log("removed market!");
       
     }); 
     //add a few comments
 }
 
 
 module.exports = seedDB;