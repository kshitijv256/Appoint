/* eslint-disable no-undef */
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { Appointment } = require("./models");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

async function checker(date, from, to) {
  const appointments = await Appointment.findAll({
    where: {
      date: date,
    },
  });
  for (let i = 0; i < appointments.length; i++) {
    if (appointments[i].from <= from && appointments[i].to >= to) {
      console.log("Appointment already exists");
      return false;
    }
  }
  return true;
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/appointment", (req, res) => {
  res.render("appointment");
});

app.post("/appointment", async (req, res) => {
  const date = req.body.date;
  const from = req.body.from;
  const to = req.body.to;
  const check = await checker(date, from, to);
  if (!check) {
    try {
      await Appointment.create({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        from: req.body.from,
        to: req.body.to,
      });
      res.render("appointment", {
        message: "Appointment created successfully",
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("appointment", { message: "Appointment already exists" });
  }
});

module.exports = app;
