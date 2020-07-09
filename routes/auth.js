const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv/config");

router.post("/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res
      .status("422")
      .json({ error: "Password, e-mail or name not filled in." });
  } else {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res
            .status("422")
            .json({ error: "User with that e-mail address already exists" });
        } else {
          bcrypt.hash(password, 12).then((hash) => {
            const user = new User({ email, name, password: hash });
            user
              .save()
              .then(() => {
                res.json({ message: "Saved user succesfully" });
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
    return res.status(422).json({ error: "E-mail or password not provided" });
  } else {
    User.findOne({ email: email }).then((savedUser) => {
      if (!savedUser) {
        return res.status(400).json({ error: "Invalid e-mail or password" });
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
              const { _id, name, email } = savedUser;
              return res.json({ token, user: { _id, name, email } });
            } else {
              return res
                .status(400)
                .json({ error: "Invalid e-mail or password" });
            }
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

module.exports = router;
