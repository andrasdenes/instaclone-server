const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");
require("dotenv/config");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "You must be logged in" });
  } else {
    const token = authorization.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "You must be logged in" });
      } else {
        const { _id } = payload;
        User.findById(_id).then((userData) => {
          req.user = userData;
          next();
        });
      }
    });
  }
};
