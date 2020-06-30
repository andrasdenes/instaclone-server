const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const requireLogin = require("../middleWare/requireLogin");

router.get("/posts", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id, name")
    .then((posts) => res.json({ posts }))
    .catch((err) => {
      console.log(err);
    });
});

router.post("/create", requireLogin, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(422).json({ message: "Please provide all fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    postedBy: req.user,
  });

  post
    .save()
    .then((result) => {
      res.json({ post: result });
    })
    .catch((err) => console.log(err));
});

router.get("/myposts", requireLogin, (req, res) => {
  Post.find({ postedBy: { _id: req.user._id } })
    .populate("postedBy", "_id, name")
    .then((posts) => {
      return res.json({ posts });
    });
});

module.exports = router;
