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
    if (
      (appointments[i].from < from && appointments[i].to > to) ||
      (appointments[i].from > from && appointments[i].to < to) ||
      (appointments[i].from < from && appointments[i].to > from) ||
      (appointments[i].from < to && appointments[i].to > to)
    ) {
      return false;
    }
  }
  return true;
}

app.get("/", async (req, res) => {
  const appointments = await Appointment.findAll({
    order: [
      ["date", "ASC"],
      ["from", "ASC"],
    ],
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
  if (
    req.body.date === "" ||
    req.body.from === "" ||
    req.body.to === "" ||
    req.body.from >= req.body.to
  ) {
    console.log("Invalid input");
    res.redirect("/");
  }
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
      console.log("Appointment created");
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } else {
    const appointments = await Appointment.findAll({
      where: {
        date: date,
      },
      order: [
        ["date", "ASC"],
        ["from", "ASC"],
      ],
    });
    freeSlot = {
      from: "",
      to: "",
    };
    var conflictingSlots = [];
    for (let i = 0; i < appointments.length; i++) {
      if (
        (from > appointments[i].from && from < appointments[i].to) ||
        (to > appointments[i].from && to < appointments[i].to)
      ) {
        if (
          i < appointments.length - 1 &&
          appointments[i].to == appointments[i + 1].from
        ) {
          conflictingSlots.push(appointments[i]);
          continue;
        } else {
          conflictingSlots.push(appointments[i]);
          var till = appointments[i].to;
          var li = till.split(":");
          if (li[0] !== "23") {
            li[0] = parseInt(li[0]) + 1;
            li[0] = li[0] < 10 ? "0" + li[0] : li[0];
          } else {
            li[0] = "00";
            li[1] = "00";
            li[2] = "00";
          }
          till = li.join(":");
          var temp =
            i < appointments.length - 1 ? appointments[i + 1].from : till;
          freeSlot = {
            from: appointments[i].to,
            to: temp,
          };
          break;
        }
      }
    }
    console.log(till);
    res.render("alternate", { freeSlot, conflictingSlots });
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
