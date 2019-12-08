
const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const user = require("../models/user");
const room = require("../models/room");
const book=require("../models/book");
const exphbs = require("express-handlebars");
const hasAccess = require("../middleware/auth");
const hasAccessAdmin = require("../middleware/admin");

router.use(express.static('public'));

require("dotenv").config({ path: './config/keys.env' });

router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/sign", (req, res) => {

    res.render("sign")
});

router.post("/sign", (req, res) => {
    /* create object */
    const formData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday,
    }

    const errors = [];
    // check empty input
    if (req.body.username == "") {
        errors.push("Please enter your username")
    }

    if (req.body.password == "") {
        errors.push("Please enter your password")
    }
    if (req.body.lastname == "") {
        errors.push("Please enter your Lastname")
    }
    if (req.body.firstname == "") {
        errors.push("Please enter your Firstname")
    }
    if (req.body.email == "") {
        errors.push("Please enter your Email")
    }
    if (req.body.password == "") {
        errors.push("Please enter your Password")
    }
    if (req.body.birthday == "") {
        errors.push("Please enter your Birthday")
    }
    if (errors.length > 0) {

        res.render("sign",
            {
                message: errors
            })
    }

    else
    // validate password format
    {
        if (!(/^[a-zA-Z0-9]{6,12}$/.test(req.body.password))) {
            errors.push("invalid password,password must be at least 6 letters or numbers ");
        }
        if (req.body.password != req.body.password2) {
            errors.push("invalid confirm password");
        }
        if (!(/^[a-zA-Z]{2,20}$/.test(req.body.lastname))) {
            errors.push("invalid Lastname")
        }
        if (!(/^[a-zA-Z]{2,20}$/.test(req.body.firstname))) {
            errors.push("invalid Firstname")
        }
        if (errors.length > 0) {

            res.render("sign",
                {
                    message: errors
                })
        }
        else {

            //if no error then save to database
            const ta = new user(formData);
            ta.save()
                .then(() => {
                    console.log('Task was inserted into database');
                    res.redirect("login");

                })
                .catch((err) => {
                    console.log(`Task was not inserted into the database because ${err}`);
                    if (err.code === 11000) {
                        res.render("sign", { message: [`Email address is been used.`] });
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
                    //hash password, compare the confirm password to first input password
                    bcrypt.compare(req.body.password, user.password)
                        .then(isMatched => {
                            if (isMatched == true) {
                                //create session
                                req.session.userInfo = user;
                                if (user._doc.admin) {
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

/*direct to adminstrator page*/

router.get("/admin", hasAccessAdmin, (req, res) => {
    res.render("admin");
});

router.get("/user",hasAccess, (req, res)=>
{
    book.find({userid: req.session.userInfo._id})
    .then(books => res.render("user", {books}))
})
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/")
});
/* under administrator mode Create a room*/
router.get("/add", hasAccessAdmin, (req, res) => {

    res.render("add");
});
router.post("/add", hasAccessAdmin, (req, res) => {
    /* create object */


    const formData = {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        location: req.body.location,
    }

    /* if empty input then tell user re-enter  */
    const error = [];


    if (req.body.title == "") {
        error.push("Please enter your title")
    }
    if (req.body.price == "") {
        error.push("Please enter Product price")
    }
    if (req.body.location == "") {
        error.push("Please enter location")
    }
    if (req.body.description == "") {
        error.push("Please enter Product description")
    }

    if (req.files == null) {
        error.push("Sorry you must upload a file")
    }
    else {
        if (req.files.profilePic.mimetype.indexOf("image") == -1) {
            error.push("Sorry you can only upload images : Example (jpg,gif, png) ")
        }
    }
    if (error.length > 0) 
    {
        res.render("add", {
            error: error,
            title: formData.title,
            description: formData.description,
            price: formData.price,
            location: formData.location
        })
    }
    else {
        const ta = new room(formData);
        ta.save()
            .then(ta => {
                req.files.profilePic.name = `db_${ta._id}${path.parse(req.files.profilePic.name).ext}`
                req.files.profilePic.mv(`public/uploads/${req.files.profilePic.name}`)
                    .then(() => {
                        room.findByIdAndUpdate(ta._id, {
                            profilePic: req.files.profilePic.name
                        })
                            .then(() => {
                                console.log(`File name was updated in the database`)
                                res.redirect("/room");
                            })
                            .catch(err => console.log(`Error :${err}`));
                    });
            })
            .catch(err => console.log(`Error :${err}`));
    }
}
)

/*edit page */
router.get("/edit/:id", hasAccessAdmin,(req, res) => {
    console.log(req.params.id);
    room.findById(req.params.id)
        .then((task) => {

            res.render("edit", {
                taskDocument: task
            })

        })
        .catch(err => {
            console.log(`Error : ${err}`);
            res.redirect('/room')
        });
});

/*update edited information */

router.put("/edit/:id", hasAccessAdmin,(req, res) => {
    const error = [];
    if (req.files == null) 
    {
        error.push("Sorry you must upload a file")
    }
    else 
    {
        if (req.files.profilePic.mimetype.indexOf("image") == -1) {
            error.push("Sorry you can only upload images : Example (jpg,gif, png) ")
        }
    }
        if (error.length > 0) 
        {

            res.render("edit", {
                message: error
            })
        }

    else{
    room.findById(req.params.id)
        .then((task) => {

            task.title = req.body.title;
            task.description = req.body.description;
            task.price = req.body.price;
            task.location = req.body.location;
           
            task.save()
                .then(task => {
                    req.files.profilePic.name = `db_${task._id}${path.parse(req.files.profilePic.name).ext}`
                    req.files.profilePic.mv(`public/uploads/${req.files.profilePic.name}`)
                        .then(() => {
                            room.findByIdAndUpdate(task._id, {
                                profilePic: req.files.profilePic.name
                            })
                                .then(() => {
                                    res.redirect("/room")
                                })
                                .catch(err => console.log(`Error : ${err}`));

                        })
                        .catch(err => console.log(`Error : ${err}`));

                });
        });
    }
    });
    
    /*booking */
    router.get("/booking/:id", hasAccess, (req, res) =>{
        room.findById(req.params.id)
        .then(task=> {
            const booking = {
                roomid: task._id,
                userid: req.session.userInfo._id,
                title: task.title,
                location: task.location,
                description:task.description,
                price: task.price,
                profilePic: task.profilePic
            }
            const booked = new book(booking)
            booked.save()
            .then(() => res.redirect("/user/user"))
            console.log(`success!`)
        })
        .catch((error) => {
            res.redirect("/room")
            console.log(`error.`)})
    });
    
    module.exports = router;
