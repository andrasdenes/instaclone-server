const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middleWare/requireLogin");
require("dotenv/config");

router.get("/", (req, res) => {
  res.send("hello");
});

router.get("/protected", requireLogin, (req, res) => {
  res.send("hello, authenticated user");
});

router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res
      .status("422")
      .json({ message: "Password, email or name not filled in." });
  } else {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res
            .status("422")
            .json({ message: "User with that e-mail address already exists" });
        } else {
          bcrypt.hash(password, 12).then((hash) => {
            const user = new User({ email, name, password: hash });
            user
              .save()
              .then((user) => {
                res.json({ message: "Saved user", userId: user._id });
              })
              .catch((err) => console.log(err));
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ message: "E-mail or password not provided" });
  } else {
    User.findOne({ email: email }).then((savedUser) => {
      if (!savedUser) {
        return res.status(400).json({ message: "Invalid e-mail or password" });
      } else {
        bcrypt
          .compare(password, savedUser.password)
          .then((match) => {
            if (match) {
              //return res.status(200).json({ message: "Succesful login" });
              const token = jwt.sign(
                { _id: savedUser._id },
                process.env.JWT_SECRET
              );
              return res.json({ token });
            } else {
              return res
                .status(400)
                .json({ message: "Invalid e-mail or password" });
            }
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

module.exports = router;
