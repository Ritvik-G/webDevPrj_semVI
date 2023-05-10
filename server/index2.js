const {createPool} = require('mysql');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors=require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const session = require('express-session');

/*
const jwt = require('jsonwebtoken');
*/

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'alumniweb',
    port: 3306
});


app.use (express.json());

app.use (cors(
    /*{
    origin: ['http://localhost:3000/login'],
    methods: ['GET','POST'],
    credentials: true,
}
*/));
/*
app.use(cookieParser());*/

app.use(bodyParser.urlencoded({extended: true}));

/*
app.use(session({
    key: 'user',
    secret: 'nitapalumnilogincredential',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60*60,
    }
}))
*/

app.get('/',(req,res) => {
    res.send('rk916');
});

/*
app.get('/',(req,res) => {
    res.send('rk916');
    
    const q = "INSERT INTO subscription (mail) VALUES ('ritvikbghsdfhby@gmail.com')";
    pool.query(q,(err,result) => {
        console.log('entered into function');
    if(err){
        console.log('Error');
    }else{
        console.log('Successful entry');
        
    }
});
});
*/

app.get('/alumni/get',(req,res) =>{
    pool.query("SELECT * FROM alumni",function(err,result,fields){
        console.log(err);
            var resultArray = Object.values(JSON.parse(JSON.stringify(result)))
            console.log(resultArray);
            res.send(resultArray);
        
    })
})

app.get('/opportunities/get',(req,res) =>{
    pool.query("SELECT * FROM opportunities",function(err,result,fields){
        console.log(err);
            var resultArray = Object.values(JSON.parse(JSON.stringify(result)))
            console.log(resultArray);
            res.send(resultArray);
        
    })
})

app.get('/account/get',(req,res) =>{
    pool.query("SELECT mail,cardurl FROM account",function(err,result,fields){
        console.log(result);
        var resultArray = Object.values(JSON.parse(JSON.stringify(result)))
        console.log(resultArray);
        res.send(resultArray);
        
    })
})

app.post('/subscription/take',(req,res) => {
    const mail= req.body.mail;
    const q2 = "INSERT INTO subscription (mail) VALUES(?) ";
    pool.query(q2,[mail,mail,mail],(err,result) => {
        console.log('entered into function2');
        if(err){
            console.log(err);
        }else{
            console.log('Successful entry');
        }
    });
});

    
    app.post('/alumni/give',(req,res)=>{
        const regno = req.body.regno;
        const rollno = req.body.rollno;
        pool.query("SELECT regno,rollno FROM alumni WHERE regno= ? and rollno = ?",[regno,rollno],function(err,result,fields){
                console.log(result);
                console.log(err);
                if (result != null && result.length >=1 ){
                    console.log("length checked");
                    res.sendStatus(202);
                    return(result);
                }else{
                    console.log("Out of loop");
                    res.sendStatus(406);
                    return (result);
                }
            });
    });

/*
const mail = 'ritvik916@gmail.com';
const password = 'gfvcfg';
public static getData(mail,password)
{
    let sql = "SELECT (mail,password) FROM account WHERE mail = '+mail+'";
    return pool.execute(sql,[mail]);

}
*/

app.post('/account/check',(req,res)=>{
    const mail = req.body.mail;
    const password = req.body.password;
    console.log("hello");
            console.log(mail);
          pool.query("SELECT mail,password FROM account WHERE mail= ?",[mail],function(err,result,fields){
            console.log(result);
            if (result != null && result.length >=1 ){
                console.log("length checked");
                bcrypt.compare(password,result[0].password,function(err,result,fields){
                    console.log(result);
                    if (result){
                        res.sendStatus(202);}
                    else{
                        console.log("Wrong Password");
                        res.sendStatus(401);}
                })
            }else{
                console.log("Username doesn't exist")
                res.sendStatus(401);
            }
        });
});


app.post('/account/take',(req,res) => {
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const mail = req.body.mail;
    const password = req.body.password;
    const cardurl = req.body.cardurl;

    bcrypt.hash(password,saltRounds,(err,hash)=> {
        if (err){console.log(err);}
        const q2 = "INSERT INTO account (regno,rollno,mail,password,cardurl) VALUES (?,?,?,?,?)"
        pool.query(q2,[regno,rollno,mail,hash,cardurl],(err,result) => {
            console.log('entered into account function');
            if(err){
                console.log(err);
            }else{
                console.log('Succesful login');
                //const q1 = "UPDATE account  SET regno = (SELECT regno from account WHERE mail = ?), rollno = (SELECT rollno from account WHERE mail = ?), mail = (SELECT mail from account WHERE mail = ?), password = (SELECT password from account WHERE mail = ?), phoneno = ?,location = ?,crole = ?,company = ?,linkedinurl = ? WHERE (regno = ?) and (rollno = ?)"
                //const q3 = "INSERT INTO account (phoneno,location,crole,company,linkedinurl) SELECT (?,?,?,?,?) FROM account WHERE mail = ?"
               /*
                const q4 ="UPDATE account  SET phoneno =? , location = ? , crole = ? , company = ?, linkedinurl = ? WHERE (regno = ?) and (rollno = ?);"
                
                pool.query(q4,[phoneno,location,crole,company,linkedinurl,regno,rollno],(err,result) => {
                    console.log('entered into profile function');
                    if(err){
                    console.log(err);
                    }else{
                     console.log('Succesful sendoff');
                    }

        });*/
        
            }
        });
    });
    
});

app.post('/profile/builder',(req,res)=> {
    const mail = req.body.mail;
    const phoneno = req.body.phoneno;
    const location = req.body.location;
    const crole = req.body.crole;
    const company = req.body.company;
    const linkedinurl = req.body.linkedinurl;
    //const profilepic = req.body.profilepic;

    const q1 = "UPDATE account  SET phoneno = ?,location = ?,crole = ?,company = ?,linkedinurl = ? WHERE  mail = ?"
    
    pool.query(q1,[phoneno,location,crole,company,linkedinurl,mail],(err,result)=>{
        console.log("Into Profile Builder");
        if (result){
            
            console.log("sendoff successful");
            res.sendStatus(202);
        }else{
            console.log(err);
        }
    })
})

app.get('/profile/retreival',(req,res)=> {

    const q1 = "SELECT alumni.name , alumni.type , alumni.branch , alumni.jnyr , alumni.psyr , account.phoneno , account.location , account.crole , account.company , account.linkedinurl FROM alumni  JOIN account ON alumni.rollno = account.rollno ;"
    
    pool.query(q1,(err,result)=>{
        console.log("Into Profile Display");
        if (err){
            console.log(err);
        }else{
            console.log("sendoff display");
            var resultArray = Object.values(JSON.parse(JSON.stringify(result)))
            console.log(resultArray);
            res.send(resultArray);
        }
    })
})


app.post('/profile/take',(req,res) => {
    //const profilepic = req.body.profilepic;
    //console.log(profilepic)
    const phoneno = req.body.phoneno;
    const location = req.body.location;
    const crole = req.body.crole;
    const company = req.body.company;
    const linkedinurl = req.body.linkedinurl;

    const q4 ="UPDATE account  SET phoneno =? , location = ? , crole = ? , company = ?, linkedinurl = ? WHERE (regno = ?) and (rollno = ?);"
        //const q2 = "INSERT INTO profile (phoneno,location,crole,company,linkedinurl) VALUES (?,?,?,?,?)"
        pool.query(q2,[phoneno,location,crole,company,linkedinurl],(err,result) => {
            console.log('entered into profile function');
            if(err){
                console.log(err);
            }else{
                console.log('Succesful sendoff');
            }
        });
        
});


app.post('/opportunities/take',(req,res) => {
    const mail = req.body.mail;
    const branch = req.body.branch;
    const cgpa = req.body.cgpa;
    const qualification = req.body.qualification;
    const cname = req.body.cname;
    const role = req.body.role;
    const salary = req.body.salary;
    const jobtype = req.body.jobtype;
    const hours = req.body.hours;
    const applicationlink = req.body.applicationlink;
    const deadline = req.body.deadline;
    const referralname = req.body.referralname;
    const referralemail = req.body.referralemail;

    const q ="INSERT INTO opportunities (mail,branch,cgpa,qualification,cname,role,salary,jobtype,hours,applicationlink,deadline,referralname,referralemail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);"
        pool.query(q,[mail,branch,cgpa,qualification,cname,role,salary,jobtype,hours,applicationlink,deadline,referralname,referralemail],(err,result) => {
            console.log('entered into opportunities function');
            if(err){
                console.log(err);
            }else{
                console.log('Succesful sendoff');
            }
        });
        
});



app.listen(3001, () => {
    console.log('running on port 3001');
})