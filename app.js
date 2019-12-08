const express = require("express");

const exphbs = require('express-handlebars');

const app = express();

const bodyParser = require("body-parser");

const mongoose = require('mongoose');

const methodOverride = require('method-override');

const bcrypt = require('bcryptjs');

const session = require('express-session');

const fileupload = require("express-fileupload");

app.engine('.hbs', exphbs({ extname:'.hbs', defaultLayout:'main'}));
app.set('view engine', '.hbs');

require("dotenv").config({path:'./config/keys.env'});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(fileupload());

app.use(session({secret:"This key is private"}));

app.use((req,res,next)=>{

    res.locals.user= req.session.userInfo;
    next();
})

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(methodOverride('_method'));

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

const userRoutes = require("./routes/user");

const generalRoutes = require("./routes/general");

app.use("/",generalRoutes);

app.use("/user",userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT);