const express = require('express');
const path = require('path');


const app = express();


// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index');
  });

app.get('/appointment', (req, res) => {
    res.render('appointment');
  });

module.exports = app;