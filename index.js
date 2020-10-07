var express=require('express');
var app = express();

//Connecting server file to AWT
let server=require('./server');
let middleware=require('./middleware');
let config=require('./config');
const response=require('express');

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;

//Databas Connection
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement()';

let db;

MongoClient.connect(url,{ useUnifiedTopology: true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database: ${dbName}`);
});

//FETCHING HOSPITAL DETAILS
app.get('/hospital', middleware.checkToken, function(req,res){
    console.log("Fetching Hospital Details from hospital collection");
    var data=db.collection('hospitalDetails').find().toArray()
        .then(result=> res.json(result));
});

//FETCHING VENTILATORS DETAILS
app.get('/ventilator', middleware.checkToken, (req,res)=>{
    console.log("Fetching Ventilator Details from ventilators collecton");
    var data=db.collection('ventilatorDetails').find().toArray()
        .then(result=>res.json(result));
});

//SEARCHING VENTILATORS BY STATUS
app.post('/searchventbystatus', middleware.checkToken, (req, res) => {
    var status=req.body.status;
    console.log(status);
    var ventilator=db.collection('ventilatorDetails').find({"status":status}).toArray().then(result=>res.json(result)); 
});

//SEARCHING VENTILATORS BY HOSPITAL NAME
app.post('/searchventbyname', middleware.checkToken, (req, res) => {
    var Name=req.body.Name;
    console.log(Name);
    var ventilator=db.collection('ventilatorDetails').find({"Name":new RegExp(Name, 'i')}).toArray().then(result=>res.json(result)); 
});

//SEARCHING HOSPITAL BY NAME
app.post('/searchhospital', middleware.checkToken,(req, res) => {
    var Name=req.body.Name;
    console.log(Name);
    var hospital=db.collection('hospitalDetails').find({"Name":new RegExp(Name, 'i')}).toArray().then(result=>res.json(result)); 
});

//UPDATE VENTILATORS DETAILS
app.put('/updateventilator', middleware.checkToken, (req, res) => {
    var ventid={ventilatorId: req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set: {status: req.body.status } };
    db.collection("ventilatorDetails").updateOne(ventid, newvalues, function(err, result) {
        res.json('1 document updated');
        if(err) throw err;
        //console.log("1 document updated");
    });
});

//ADD VENTILATORS
app.post('/addventilatorbyuser', middleware.checkToken, (req, res) =>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var Name=req.body.Name;

    var item=
    {
        hId:hId, ventilatorId:ventilatorId,status:status,Name:Name
    };
    db.collection('ventilatorDetails').insertOne(item, function(err, result) {
        res.json('Item inserted');
    });
});

//DELETE VENTILATORS BY VENTILATORID
app.delete('/delete', middleware.checkToken, (req, res) =>{
    var myquery=req.body.ventilatorId;
    console.log(myquery);

    var myquery1=
    {
        ventilatorId:myquery 
    };
    db.collection('ventilatorDetails').deleteOne(myquery1, function(err, obj) {
        if(err) throw err;
       
        res.json('1 document deleted');
    });
});


app.listen(100,function(){
    console.log('Server Started');
})