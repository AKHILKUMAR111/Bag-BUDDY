const mongoose = require("mongoose")
const config=require("config");

const dbgr = require("debug")("development:mongoose");
                             // anyname can be written above not necessarily deveopment or mongoose
                             // but it should be same in app.js



mongoose
.connect(`${config.get("MONGODB_URI")}/majorproject`)    //using ``(backtick) and $ to put dynamic values
.then(function(){  

dbgr("connected to database");      //this debug msg will not be shown until you set environment variable to show it 
// setting environment variable:
    //1.  $env:DEBUG="development:*"  //for windows if in powershell
        //prints detailed log for namespace development   for any specific debug you can use the name in place of *   like development:mongoose
    //2.  export DEBUG="development:*"  //for linux
//removing the environment variable to stop recieving these debug logs
     //$env:DEBUG="" 
})
.catch(function(err){
    dbgr(err);
})

module.exports = mongoose.connection;