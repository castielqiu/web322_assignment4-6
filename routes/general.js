const express = require('express')
const router = express.Router();

router.get("/", (req, res) => {

    res.render("home")
});

router.get("/room", (req, res) => {

    res.render("room")
});


module.exports=router;