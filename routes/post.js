const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const requireLogin = require("../middleWare/requireLogin");

router.get("/posts", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy comments.author", "_id, name")
    .then((posts) => res.json({ posts }))
    .catch((err) => {
      console.log(err);
    });
});

router.post("/create", requireLogin, (req, res) => {
  const { title, body, pic } = req.body;
  console.log(req.body);
  if (!title || !body || !pic) {
    return res.status(422).json({ error: "Please provide all fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    photo: pic,
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

router.put("/like", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy comments.author", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        return res.json(result);
      }
    });
});

router.put("/unlike", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy comments.author", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        return res.json(result);
      }
    });
});

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    author: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.author", "_id, name")
    .exec((err, result) => {
      if (err) {
        console.log(err);
        return res.status(422).json({ error: err });
      } else {
        return res.json(result);
      }
    });
});

router.delete("/deletepost/:postId", requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => res.json(result))
          .catch((err) => console.log(err));
      }
    });
});

router.delete("/deletecomment:commentId", requireLogin, (req, res) => {});

module.exports = router;
