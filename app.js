/* eslint-disable no-undef */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Appointment } = require('./models');


const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('index');
  });

app.get('/appointment', (req, res) => {
    res.render('appointment');
  });

app.post('/appointment', async (req, res) => {
    try{
        await Appointment.create({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            date: req.body.date,
            from: req.body.from,
            to: req.body.to,
        });
        res.redirect('/appointment');
    } catch (err) {
        console.log(err);
    }
});


module.exports = app;