var express = require("express");
var fs = require("fs");
var Chance = require('chance');
var chance = new Chance();
var config = require("./config.json")
var jobs = require("./jobs.json");
var https = require("https");
var app = express();
app.use(express.static("static"))
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post("/job", function(req, res){
  var key = chance.hash();
  var codename = chance.word({length:5});
  var newjob = req.body;
  newjob.key = key;
  newjob.codename = codename;
  jobs[newjob.codename] = newjob;
  var strung = JSON.stringify(jobs);
  fs.open("./jobs.json", "w+", function(err, fd){
    fs.writeFile(fd, strung, function(){
      jobs = require("./jobs.json");
      res.redirect("/");
      var uri = encodeURI("https://maker.ifttt.com/trigger/job_recieved/with/key/"+config.iftttkey+"?value1="+req.body.type.toUpperCase()+"&value2="+key+"&value3="+codename);
      https.get(uri, function(req, res){
      })
    })
  })
})
app.get("/jobs/:jobname/key/:key", function(req, res){
  var reqjob = jobs[req.params.jobname];
  if(reqjob.key == req.params.key){
    console.log("Authorized user accepted, showing them job "+req.params.jobname);
    var contact = ""
    if(reqjob.phone){
      contact +="Phone:"+reqjob.phone + "<br>"
    }
    if (reqjob.email){
      contact +="Email:"+reqjob.email+"<br>"
    }
    if(!reqjob.email && !reqjob.phone){
      contact +="No contact information provided"
    }
    var html ="<html><head></head><body>"+req.params.jobname.toUpperCase()+"<br>TYPE:"+reqjob.type.toUpperCase()+"<br>From: "+reqjob.name+"<br>"+contact+"<br>Description:<br>"+reqjob.description+"</body></html>"
    res.send(html);
  } else {
    console.log("User attempted to access job "+req.params.jobname +" without the proper credentials. Screw off please.")
  }
})
app.listen(2000);
