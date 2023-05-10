const {createPool} = require('mysql');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors=require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path');
const fs = require('fs');
const { parse } = require('path');
var fileupload = require("express-fileupload");
var nodemailer = require('nodemailer');

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'alumniwebsite',
    port: 3306
});

const multer = require("multer");


app.use (express.json({limit: "50mb"}));

app.use (cors());

//app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}))

app.use(fileupload());


// FUNCTIONS

// function to encode file data to base64 encoded string
/*
function base64_encode(file) {
    // read binary data
    console.log("Inside base64 encoder")
    var bitmap = fs.readFileSync(file.size);
    // convert binary data to base64 encoded string
    console.log("before sending value of base ")
    
    return new Buffer.alloc(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}
*/






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
            res.send({msg:"Subscribed"})
        }
    });

});

//2. Alumni Search
app.get("/alumni",(req,res)=>{
    const q = "SELECT * FROM alumni where regno <> 0;"
    pool.query(q,function(err,result){
        var resArr = Object.values(JSON.parse(JSON.stringify(result)))
        res.send(resArr)
    })
})

// Events display page
app.get("/eventdisp",(req,res)=>{
    const q = "Select * FROM events;"
    pool.query(q,function(err,result){
        var resArr = Object.values(JSON.parse(JSON.stringify(result)))
        res.send(resArr)
    })
})

// Panel extraction
app.post("/panel",(req,res)=>{
    const mail = req.body.mail;
    const q = "Select * from panel where mail = ?;"
    pool.query(q,[mail],(result,err)=>{
        if(err){
            console.log(err)
        }else{
            console.log(result)
            res.send(result)
        }
    })
})

//Image upload
app.post("/fileupload",function(req,res){
    let file;
    //console.log(req.files)
    if (!req.files){
        console.log("File not found")
        return;
    }
    file = req.files.file;
    console.log(file);
    let filename = file.name;
    console.log(filename);
    const loc = "./images/events/"+"test.txt";
    console.log(loc)
    var buf = new Buffer.alloc(file.size);
    buf.write(file.data.toString("base64"));
    //buf.write(file)
    //const buf = base64_encode(file);
    //console.log(buf)
    fs.writeFile(loc,buf,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Happy")
        }
    })
})

// Image dowload
app.get("/filedownload",function(req,res){
    const loc = "./images/events/test.txt";
    let buff = fs.readFileSync(loc);
    console.log(buff);
    var buf = new Buffer.from(buff)
    console.log(buf);
    console.log({buffer: buf.toString()})
    res.send({buffer: buf})
})


//3 Signup Validation
app.post("/validatesignup",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const programme = req.body.programme;
    const branch = req.body.branch;
    const jnyr = req.body.jnyr;
    const psyr = req.body.psyr;
    const mail = req.body.mail;
    const password = req.body.password;

    const q1 = "SELECT * FROM alumniwebsite.alumni WHERE regno= ? and rollno = ? and programme = ? and branch = ? and jnyr = ? and psyr = ?;"
    
    const q3 = "SELECT * FROM alumniwebsite.account WHERE mail = ?;";
    pool.query(q3,[mail],function(err,result1,fields){
        console.log(result1)
        if (result1 != null && result1.length >=1 ){
            console.log("Exists")
            res.send({msg:"Exists"});
            return(resul);
        }else{
            pool.query(q1,[regno,rollno,programme,branch,jnyr,psyr],function(err,result,fields){
                if (result != null && result.length >=1 ){
                    console.log("True")
                    
                            bcrypt.hash(password,saltRounds,(err,hash)=> {
                                const q = "INSERT INTO alumniwebsite.account (regno,rollno,mail,password) VALUES (?,?,?,?);"
                                pool.query(q,[regno,rollno,mail,hash],(err,resu)=>{
                                    if(err){
                                        console.log("False")
                                        console.log(err)
                                        res.send({msg:"Invalid"});
                                    }else{
                                        console.log("True")
                                        res.send({msg:"Valid"});
                                        return(result);
                                    }
                                })
                            })
                }else{
                    console.log("False")
                    console.log(result)
                    res.send({msg:"Invalid"});
                    return (result);
                }
            })
        }
    })
    
})


// Alumni insert
app.post("/alumnientry",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const name = req.body.name;
    const programme = req.body.programme;
    const branch = req.body.branch;
    const jnyr = req.body.jnyr;
    const psyr = req.body.psyr;
    const q = "INSERT INTO alumni (regno,rollno,name,programme,branch,jnyr,psyr) VALUES (?,?,?,?,?,?,?);"
    pool.query(q,[regno,rollno,name,programme,branch,jnyr,psyr],(err)=>{
        if(err){
            console.log(err)
        }else{
            res.sendStatus(200)
        }
    })
})

//3 Signup Validation
app.post("/validatesignup1",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const q = "SELECT regno,rollno FROM alumniwebsite.alumni WHERE regno= ? and rollno = ?;"
    pool.query(q,[regno,rollno],function(err,result,fields){
        if (result != null && result.length >=1 ){
            console.log("True")
            res.send({msg:"Valid"});
            return(result);
        }else{
            console.log("False")
            res.send({msg:"Invalid"});
            return (result);
        }
    })
})

//4. Openings Search
app.get("/openingsdisp",(req,res)=>{
    const q = "SELECT *,DATE_FORMAT(deadline,'%d/%m/%Y') AS deadline FROM openings WHERE deadline >= CURDATE() ORDER BY deadline ;"
    pool.query(q,function(err,result){
        var resArr = Object.values(JSON.parse(JSON.stringify(result)))
        res.send(resArr)
    })
})

//5. Openings Add
app.post("/openings",(req,res)=>{
    const cname = req.body.cname;
    const role = req.body.role;
    const job = req.body.jobtype;
    const link = req.body.applicationlink;
    const deadline = req.body.deadline;
    const referral = req.body.referralname;

    const q = "INSERT IGNORE INTO openings (company,role,jobtype,link,deadline,referral) VALUES (?,?,?,?,?,?);"
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
    console.log("Hi")
    const mail = req.body.mail;
    const password = req.body.password;
    const q = "SELECT mail,password FROM account WHERE mail= ?";
    pool.query(q,[mail],(err,result)=>{
        console.log(result)
        if (result != null && result.length == 0){
            console.log("Error Occured")
            res.send({msg:"denied"});
        }else{
            bcrypt.compare(password,result[0].password,function(err,result,fields){
                console.log(result)
                if (result){
                    res.send({msg:"Valid"})
                }else{
                    res.send({msg:"Invalid"})
                }
            })
        }
    })
})

//7. Account Creation
app.post("/account",(req,res)=>{
    console.log("Testaccount")
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
    const instcountry = req.body.instcountry;
    const gatescr = req.body.gatescr;
    const grescr = req.body.grescr;
    const ieltscr = req.body.ieltscr;
    const catscr = req.body.catscr;

    const q2 = "INSERT INTO facilitate (mail) VALUES (?);"
    pool.query(q2,[email],(err)=>{
        if(err){
            console.log(err)
        }
    })

    bcrypt.hash(password,saltRounds,(err,hash)=> {
        const q = "INSERT INTO account (regno,rollno,mail,password,phone,location,linkedin,institute,course,instcountry,gatescore,grescore,ieltscore,catscore,role,company) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);"
        pool.query(q,[regno,rollno,email,hash,phone,location,linkedin,instname,course,instcountry,gatescr,grescr,ieltscr,catscr,crole,company],(err,result)=>{
            if(err){
                console.log("False")
                console.log(err)
                res.send({msg:"Invalid"});
            }else{
                console.log("True")
                res.send({msg:"Valid"});
            }
        })
    })
})

//8. Profile Card
app.post("/profile",(req,res)=>{
    const mail = req.body.mail;
    const q = "SELECT * FROM account JOIN alumni on account.regno = alumni.regno WHERE account.mail = (?);"
    pool.query(q,[mail],(err,result)=>{
        if(err){
            console.log(err)
        }else{
            var resArr = Object.values(JSON.parse(JSON.stringify(result)))
            console.log(resArr)
            res.send(resArr)
        }
    })
})

//9. Profile Builder
app.post("/profilebuilder",(req,res)=>{
    console.log("CHUNGUS")
    const mail = req.body.mail;

    const linkedin = req.body.linkedin;

    const crole = req.body.crole;
    const company = req.body.company;

    const instname = req.body.instname;
    const course = req.body.course;
    const instcountry = req.body.instcountry
    const gatescr = req.body.gatescr;
    const grescr = req.body.grescr;
    const ieltscr = req.body.ieltscr;
    const catscr = req.body.catscr;

    const q = "UPDATE account  SET linkedin = ? , role = ? , company = ? , institute = ? , course = ? , instcountry = ? ,  gatescore = ? , grescore = ? , ieltscore = ? , catscore = ? WHERE mail = ?;"

    pool.query(q,[linkedin,crole,company,instname,course,instcountry,gatescr,grescr,ieltscr,catscr,mail],(err,result)=>{
        if(err){
            console.log(err)
        }else{
            res.send({msg:"Valid"});
        }
    })
})

//10. Facilitate Us
app.post("/facilitateus",(req,res)=>{
    const mail = req.body.mail;
    const scholarship = req.body.scholarship;
    const mentor = req.body.mentor;
    const career = req.body.career;
    const almaconnect = req.body.almaconnect;
    const recruitment = req.body.recruitment;
    const other = req.body.other;

    const q = "UPDATE facilitate SET scholarship = ? , mentor = ? , career = ? , almaconnect = ? , recruitment = ? , other = ? WHERE mail = ?"

    pool.query(q,[scholarship,mentor,career,almaconnect,recruitment,other,mail],(err,result)=>{
        if(err){
            console.log(err)
        }else{
            console.log("mamama")
            res.sendStatus(200);
        }
    })
})

// Mailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'almaconnect@nitandhra.ac.in',
      pass: 'almaconnect@nitap'
    }
  });

app.post("/forgotpassword",(req,res)=>{
    const mail = req.body.mail;
    const password = req.body.password;
    bcrypt.hash(password,saltRounds,(err,hash)=> {
        const q = "UPDATE account SET password = ? WHERE mail = ?"
        pool.query(q,[hash,mail],(err,result)=>{
            if(err){
                console.log("False")
                console.log(err)
                res.sendStatus(400)
            }else{
                console.log("True")
                var mailOption={
                    from: "almaconnect@nitandhra.ac.in",
                    to: mail,
                    subject:"Temporary Password for ALMAConnect",
                    text:"Make sure to change the password once entered into the ALMAConnect website. \n \n The temporary password is: "+password
                };
                transporter.sendMail(mailOption,function(error,info){
                    if(error){
                        console.log("False");
                        console.log(error)
                        res.sendStatus(400)
                    }else{
                        console.log("True")
                        res.sendStatus(200)
                    }
                })
            }
        })
    })
})


app.post("/signupvalidate",(req,res)=>{
    const regno = req.body.regno;
    const rollno = req.body.rollno;
    const programme = req.body.programme;
    const branch = req.body.branch;
    const jnyr = req.body.jnyr;
    const psyr = req.body.psyr;
    const mail = req.body.mail;
    const password = req.body.password;
    const phone = req.body.phone;
    const location = req.body.location;
    
    console.log(regno+" "+rollno+" "+programme+" "+branch+" "+jnyr+" "+psyr);

    const q1 = "SELECT * FROM alumniwebsite.account WHERE mail = ?;";
    const q2 = "SELECT * FROM alumniwebsite.alumni WHERE regno= ? and rollno = ? and programme = ? and branch = ? and jnyr = ? and psyr = ?;"
    const q3 = "INSERT INTO alumniwebsite.account(rollno,regno,mail,password,phone,location) VALUES (?,?,?,?,?,?);"
    
    pool.query(q1,[mail],(err,outcome)=>{
        if(err){
            console.log("mail validation error")
            res.send({msg:"Failed"})
        }else{
            if (outcome != null && outcome.length >=1 ){
                console.log("Exists")
                res.send({msg:"Exists"});
                return(outcome);
            }else{
                pool.query(q2,[regno,rollno,programme,branch,jnyr,psyr],(err,resul)=>{
                    if(err){
                        console.log("Data validation Error")
                        res.send({msg: "Failed"})
                    }else{
                        if (resul != null && resul.length >=1){
                            bcrypt.hash(password,saltRounds,(err,hash)=> {
                                pool.query(q3,[rollno,regno,mail,hash,location,phone],(err,result)=>{
                                    if(err){
                                        console.log("Insertion failed")
                                        res.send({msg:"Failed"})
                                    }else{
                                        console.log("Successful")
                                        res.send({msg:"Valid"})
                                    }
                                })
                            })
                        }else{
                            console.log("Account doesn't exist")
                            res.send({msg:"Invalid"})
                        }
                    }
                })
            }
        }

    })
})


app.post("/changepassword",(req,res)=>{
    const mail = req.body.mail;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const q = "SELECT mail,password FROM account WHERE mail= ?";
    pool.query(q,[mail],(err,result)=>{
        if (result != null && result.length == 0){
            res.send({msg:"denied"});
        }else{
            bcrypt.compare(password,result[0].password,function(err,result,fields){
                console.log("Test Subject1")
                console.log(result)
                if (result){
                    bcrypt.hash(newPassword,saltRounds,(err,hash)=> {
                        const q1 = "UPDATE account SET password = ? WHERE mail = ?"
                        pool.query(q1,[hash,mail],(err,result)=>{
                            console.log("Test Subject")
                            if(err){
                                console.log("False")
                                console.log(err)
                                res.send({msg:"false"})
                            }else{
                                console.log("True")
                                res.send({msg:"true"})
                            }
                        })
                    })
                    
                }else{
                    res.send({msg:"false"})
                }
            })
        }
    })
})

app.post("/imgupload1",(req,res)=>{
    console.log("Reached for imgupload1")
    console.log(req.files.imgfile)
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("eror occured")

        return res.status(400).send('No files were uploaded.');
    }
    let imgList = ['.png','.jpg'];
    let targetFile = req.files.imgfile;
    const email = req.body.email;
    let extName = path.extname(targetFile.name);
    console.log("File name is: "+extName)
    console.log("email is: "+email);
    if(!imgList.includes(extName)  ){
        console.log("image is not json")
        return res.json({submit:false,msg:"Only jpg ,jpeg and png"})
    }
    
    if(targetFile.size > 2000000 ){
       console.log("Image is too large")
        return res.json({submit:false,msg:"File should be less then 2 MB "})
     }
    const q1 = "Select rollno from alumniwebsite.account where mail=?;"
    pool.query(q1,[email],(err,result)=>{
        console.log(result)
        let resu = JSON.parse(JSON.stringify(result))
        let res2 = resu[0].rollno
        console.log(res2)
    if(err){
        console.log("False")
        console.log(err)
    }else{
        console.log("True")
        let rollno = res2;
        
        console.log("Rollno: "+rollno)
    
     let uploadDir = path.join(__dirname, '../alumni/public/profile_images', rollno+extName);

    console.log("starting to upload into directory")
    targetFile.mv(uploadDir, (err) => {
        if (err)
        {
            console.log(err)
            return res.status(500).send(err);
        }
        else{
                    const imgname=rollno+extName
                    console.log(imgname)
                    let sql="Update account set pimage = ? where mail = ?;";
                    pool.query(sql,[imgname,req.body.email],(err,resulted)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else{
                              console.log("inserted");
                              res.send({msg:"sent"})
                        }
                    })
        }
    });
    }
    })
})


app.post("/imgupload",(req,res)=>{
    console.log("Reached for imgupload")
    console.log(req.files.imgfile)
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log("eror occured")

        return res.status(400).send('No files were uploaded.');
    }

    let imgList = ['.png','.jpg','.jpeg','.PNG'];
    let targetFile = req.files.imgfile;

    let extName = path.extname(targetFile.name);
    if(!imgList.includes(extName)  ){
        console.log("image is not json")
        return res.json({submit:false,msg:"Only jpg ,jpeg and png"})
    }
    
    if(targetFile.size > 2000000 ){
       console.log("Image is too large")
        return res.json({submit:false,msg:"File should be less then 2 MB "})
     }
  
     let uploadDir = path.join(__dirname, '../alumni/public/profile_images', req.body.rollno+extName);

    console.log("starting to upload into directory")
    targetFile.mv(uploadDir, (err) => {
        if (err)
        {
            console.log(err)
            return res.status(500).send(err);
        }
        else{
                    const imgname=req.body.rollno+extName
                    console.log(imgname)
                    const data={
                        email:req.body.email,
                        image:imgname,
                    };
                    let sql="INSERT IGNORE INTO img_upload(email,image) VALUES (?,?);";
                    pool.query(sql,[req.body.email,imgname],(err,result)=>{
                        if(err)
                        {
                            console.log(err);
                        }
                        else{
                              console.log("inserted");
                            res.json({submit:true,fliname:targetFile.name,name:data.name,email:data.email})
                        }
                    })
        }
    });
})


app.post("/imgload",(req,res)=>{
    console.log("Inside imageload")
    const email = req.body.email;
    q = "Select image from img_upload where email = ?;"
    pool.query(q,[email],(err,result)=>{
        if(err){
            console.log(err);
        }else{
            console.log("sentoff");
            var resArr = Object.values(JSON.parse(JSON.stringify(result)))
            console.log(resArr);
            res.send(resArr);
        }
    })
})


//Checking for existence
app.listen(3001, () => {
    console.log('running on port 3001');
})