const express = require('express')
const router = express.Router();
const room = require("../models/room");
router.get("/", (req, res) => {

    res.render("home")
});
router.get("/room", (req, res) => {
   const query = {};
   if (req.query.location) {
       query.location = req.query.location;
   }
    room.find(query)
    .then((room)=>{
        console.log(room);
        res.render("room",
        {
            lists:room
        });
    })
    .catch(err=>console.log(`Error : ${err}`));
    
});
module.exports=router;