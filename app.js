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
  if (from >= to) {
    return false;
  }
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

app.get("/", async (req, res) => {
  const appointments = await Appointment.findAll({
    order: [["date", "ASC"]],
  });
  res.render("appointment", { appointments, message: "" });
});

app.get("/addNew", (req, res) => {
  res.render("new");
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const appointment = await Appointment.findOne({
    where: {
      id: id,
    },
  });
  res.render("edit", { appointment });
});

app.post("/appointment", async (req, res) => {
  const date = req.body.date;
  const from = req.body.from;
  const to = req.body.to;
  const check = await checker(date, from, to);
  if (check) {
    try {
      await Appointment.create({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        from: req.body.from,
        to: req.body.to,
      });
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } else {
    res.render("new", { message: "Timming is Invalid" });
  }
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  try {
    await Appointment.update(
      {
        title: title,
        description: description,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await Appointment.destroy({
      where: {
        id: id,
      },
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = app;
