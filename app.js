const express = require("express");

const exphbs = require('express-handlebars');

const app = express();

app.use(express.static('public'));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get("/", (req, res) => {

    res.render("home")
});

app.get("/room", (req, res) => {

    res.render("room")
});
app.get("/sign", (req, res) => {

    res.render("sign")
});

app.listen(3000);