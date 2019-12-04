const express = require('express')
const router = express.Router();
const room = require("../models/room");
router.get("/", (req, res) => {

    res.render("home")
});
router.get("/room", (req, res) => {
   
    room.find()
    .then((rooms)=>{
        console.log(rooms);
        res.render("room",
        {
            lists:rooms
        });
    })
    .catch(err=>console.log(`Error : ${err}`));
    
});
module.exports=router;