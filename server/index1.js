const {createPool} = require('mysql');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors=require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'alumniwebsite',
    port: 3306
});


app.use (express.json());

app.use (cors());

app.use(bodyParser.urlencoded({extended: true}));



app.get('/',(req,res) => {
    res.send('rk916');
});

//1. Subscription
app.post('/subscription',(req,res)=> {
    const mail = req.body.mail
    const q = "INSERT IGNORE INTO subscription (mail) VALUES (?);"
    pool.query(q,[mail],(err,result)=>{
        if (err){
            console.log(err)
        }else{
            console.log("Subscribed")
            res.sendStatus(200)
        }
    });

});

//2. Alumni Search
app.get("/alumni",(req,res)=>{
    const q = "SELECT * FROM alumni;"
    pool.query(q,function(err,result){
        var resArr = Object.values(JSON.parse(JSON.stringify(result)))
        res.send(resArr)
    })
})

//3 Signup Validation
app.post("/validatesignup",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const q = "SELECT * FROM alumni WHERE regno = (?) and rollno = (?);"
    pool.query(q,[regno,rollno],(result)=>{
        if (result){
            res.sendStatus(200);
        }else{
            res.sendStatus(400);
        }
    })
})

//4. Openings Search
app.get("/openingsdisp",(req,res)=>{
    const q = "SELECT * FROM openings;"
    pool.query(q,function(err,result){
        var resArr = Object.values(JSON.parse(JSON.stringify(result)))
        res.send(resArr)
    })
})

//5. Openings Add
app.post("/openings",(req,res)=>{
    const cname = req.body.cname;
    const role = req.body.role;
    const job = req.body.job;
    const link = req.body.link;
    const deadline = req.body.deadline;
    const referral = req.body.referral;

    const q = "INSERT IGNORE INTO openings (cname,role,job,link,deadline,referral) VALUES (?,?,?,?,?,?);"
    pool.query(q,[cname,role,job,link,deadline,referral],(err)=>{
        if (err){
            console.log(err)
        }else{
            res.sendStatus(200)
        }
    })
})

//6. Login validation
app.post("/validatelogin",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const q = "SELECT * FROM account WHERE regno = (?) and rollno = (?);"
    pool.query(q,[regno,rollno],(result)=>{
        if (result){
            res.sendStatus(200);
        }else{
            res.sendStatus(400);
        }
    })
})

//7. Account Creation
app.post("/account",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const email = req.body.email;
    const password = req.body.password;

    const phone = req.body.phone;
    const location = req.body.location;
    const linkedin = req.body.linkedin;

    const crole = req.body.crole;
    const company = req.body.company;

    const instname = req.body.instname;
    const course = req.body.course;
    const gatescr = req.body.gatescr;
    const grescr = req.body.grescr;
    const ieltscr = req.body.ieltscr;

    bcrypt.hash(password,saltRounds,(err,hash)=> {
        const q = "INSERT INTO account (regno,rollno,email,password,phone,location,linkedin,crole,company,instname,course,gatescr,grescr,ieltscr) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
        pool.query(q,[regno,rollno,email,hash,phone,location,linkedin,crole,company,instname,course,gatescr,grescr,ieltscr],(err,result)=>{
            if(err){
                res.sendStatus(400);
            }else{
                res.sendStatus(200);
            }
        })
    })
})

//8. Profile Card
app.post("/profile",(req,res)=>{
    const mail = req.body.mail;
    const q = "SELECT * FROM account JOIN alumni on account.regno = alumni.regno WHERE account.mail = (?)"
    pool.query(q,[mail],(err,result)=>{
        if(err){
            console.log(err)
        }else{
            var resArr = Object.values(JSON.parse(JSON.stringify(result)))
            res.send(resArr)
        }
    })
})

//9. Profile Builder
app.post("/profilebuilder",(req,res)=>{
    const mail = req.body.mail;

    const phone = req.body.phone;
    const location = req.body.location;
    const linkedin = req.body.linkedin;

    const crole = req.body.crole;
    const company = req.body.company;

    const instname = req.body.instname;
    const course = req.body.course;
    const gatescr = req.body.gatescr;
    const grescr = req.body.grescr;
    const ieltscr = req.body.ieltscr;

    const q = "UPDATE account  SET phone = ? , location = ? , linkedin = ? , crole = ? , company = ? , instname = ? , course = ? , gatescr = ? , grescr = ? , ieltscr = ? WHERE mail = ?;"

    pool.query(q,[phone,location,linkedin,crole,company,instname,course,gatescr,grescr,ieltscr,mail],(err,result)=>{
        if(err){
            console.log(err)
        }else{
            res.sendStatus(200);
        }
    })
})


//Checking for existence
app.listen(3001, () => {
    console.log('running on port 3001');
})