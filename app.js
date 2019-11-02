const express = require("express");

const exphbs = require('express-handlebars');

const app = express();

const bodyParser = require("body-parser");

const mongoose = require('mongoose');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


//mongoose
const DBURL= "mongodb+srv://cass:allen408@cluster0-a7kxx.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(DBURL, {useNewUrlParser: true,
                    useUnifiedTopology: true})

.then(()=>{
    console.log(`Database is connected`)
})

.catch(err=>{
    console.log(`not connected : ${err}`);
})


app.get("/", (req, res) => {

    res.render("home")
});

app.get("/room", (req, res) => {

    res.render("room")
});
app.get("/sign", (req, res) => {

    res.render("sign")
});
app.post("/sign",(req,res)=>
{
    const Tasks=require("./task/task");

    const formData ={
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        password:req.body.password,
        birthday:req.body.birthday,
    }
   
    const ta = new Tasks(formData);
    ta.save()
    .then(() => 
    {
        console.log('Task was inserted into database')
    })
    .catch((err)=>{
        console.log(`Task was not inserted into the database because ${err}`)
    })
    const error=[];
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
    if(error.length > 0)
      {

          res.render("sign",
          {
             message:error
          })
      }
      else
      {
        if(!(/^[a-zA-Z0-9]{6,12}$/.test(req.body.password)))
        {
            error.push("invalid password,password must be at least 6 letters or numbers ");
        }
        if(!(/^[a-zA-Z]{2,20}$/.test(req.body.lastname)))
        {
        error.push("invalid Lastname")
        }
        if(!(/^[a-zA-Z]{2,20}$/.test(req.body.firstname)))
        {
        error.push("invalid Firstname")
        }
        if(error.length > 0)
         {

          res.render("sign",
          {
             message:error
          })
        }
        else 
        {
           
        
         // SEND THE EMAIL
         const nodemailer = require('nodemailer');
         const sgTransport = require('nodemailer-sendgrid-transport');

         const keys =require('./keys/key');

         const options=
          {
            auth: {
                api_key: keys.sendgrid_key
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
        res.redirect("/room");
        }
        
        }
      }
)
app.get("/login", (req, res) => {

    res.render("login")
});
app.post("/login",(req,res)=>{

    const errors =[];

    if(req.body.username=="")
    {
        errors.push("Please enter your username")
    }
    
    if(req.body.password=="")
    {
        errors.push("Please enter your password")
    }

      if(errors.length > 0)
      {

          res.render("login",
          {
             message:errors 
          })
      }

      else
      {
            if(/^[a-zA-Z0-9]{6,12}$/.test(req.body.password))
        {
           res.redirect("/room");
      }
      else 
      {
        res.render("login",
        {
           message:["Password must have letters and numbers only"] 
        })
      }
    }

});
const PORT = process.env.PORT || 3000;
app.listen(PORT);