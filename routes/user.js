  
const express = require('express');
const router = express.Router();
const bcrypt= require("bcryptjs");
const path = require("path");
const Tasks=require("../models/user");
const user = require("../models/user");
const exphbs = require("express-handlebars");
const hasAccess = require("../middleware/auth");
const hasAccessAdmin = require("../middleware/admin");

router.use(express.static('public'));

require("dotenv").config({path:'./config/keys.env'});

router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/sign", (req, res) => {

    res.render("sign")
});


router.post("/sign",(req,res)=>
{
    /* create object */
    const formData ={
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        password:req.body.password,
        birthday:req.body.birthday,
    }
   
    const errors =[];
    // check empty input
        if(req.body.username=="")
        {
            errors.push("Please enter your username")
        }
        
        if(req.body.password=="")
        {
            errors.push("Please enter your password")
        }
        if(req.body.lastname=="")
        {
        error.push("Please enter your Lastname")
        }
        if(req.body.firstname=="")
        {
        error.push("Please enter your Firstname")
        }
        if(req.body.email=="")
        {
        error.push("Please enter your Email")
        }
        if(req.body.password=="")
        {
        error.push("Please enter your Password")
        }
        if(req.body.birthday=="")
        {
        error.push("Please enter your Birthday")
        }
          if(errors.length > 0)
          {
    
              res.render("sign",
              {
                 message:errors 
              })
          }
    
          else
          // validate password format
          {
            if(!(/^[a-zA-Z0-9]{6,12}$/.test(req.body.password)))
            {
            errors.push("invalid password,password must be at least 6 letters or numbers ");
            }
            if(req.body.password != req.body.password2)
            {
            errors.push("invalid confirm password");
            }
            if(!(/^[a-zA-Z]{2,20}$/.test(req.body.lastname)))
            {
            errors.push("invalid Lastname")
            }
            if(!(/^[a-zA-Z]{2,20}$/.test(req.body.firstname)))
            {
            errors.push("invalid Firstname")
             } 
            if(errors.length > 0)
            {

          res.render("sign",
          {
             message:errors
          })
          }
          else
          {
            const ta = new user(formData);
            ta.save()
            .then(() => 
            {
                console.log('Task was inserted into database');
                // send email
        /* 
         the sendgrid keep making my account under view so i not using this confirmation email
        const nodemailer = require('nodemailer');
         const sgTransport = require('nodemailer-sendgrid-transport');
         
         const options=
          {
            auth: {
                api_key: process.env.sendgrid_key
            }
        }
        const text=`Dear ${req.body.firstname}`
        const mailer = nodemailer.createTransport(sgTransport(options));
 
         const email = {
             to: `${req.body.email}`,
             from: 'admin@myzhiwei.com',
             subject: 'confirmation',
             text: `Congratulation! you are one of us!!!!`, 
             html: `Congratulation! you are one of us!!!!`
         };
          
         mailer.sendMail(email, (err, res)=> {
             if (err) { 
                 console.log(err) 
             }
             console.log(res);
         });
         */
         res.redirect("login");
         
    })
            .catch((err)=>{
                console.log(`Task was not inserted into the database because ${err}`);
                if (err.code === 11000)
                {
                    res.render("sign", {message: [`Email address is been used.`]});
                }
                })
        }
          }
        }
)
// Authentication
router.post("/login", (req, res) => {

    const errors = [];

    if (req.body.username == "") {
        errors.push("Please enter your username")
    }

    if (req.body.password == "") {
        errors.push("Please enter your password")
    }

    if (errors.length > 0) {

        res.render("login", {
            message: errors
        })
    }

    else {
        if (/^[a-zA-Z0-9]{6,12}$/.test(req.body.password)) {
            user.findOne({ email: req.body.email })
                .then(user => {
                    console.log(user);
                    bcrypt.compare(req.body.password, user.password)
                        .then(isMatched => {
                            if (isMatched == true) {
                                req.session.userInfo = user;
                                if (user._doc.admin){
                                    res.redirect("/user/admin");
                                }
                                else {
                                res.redirect("/user/user")
                                }
                            }
                            else {
                                errors.push("Password not match");
                                res.render("login", {
                                    message: errors
                                })
                            }
                        })
                })
                .catch(err => {
                    res.render("login", {
                        message: ["Opps...Incorrect UserName or Password."]
                    })
                })

        }

        else {
            res.render("login", {
                message: ["Password must have letters and numbers only"]
            })
        }
    }

});  

router.get("/admin", hasAccessAdmin, (req, res) => {
    res.render("admin");
});
router.get("/user", hasAccess, (req, res) => {
    res.render("user");
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
});

module.exports=router;


