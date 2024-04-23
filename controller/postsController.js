const { validationResult } = require("express-validator");
const Profile = require("../model/Profiles.js");
const User = require("../model/UserModel.js");
const Post = require("../model/Posts.js");
const e = require("express");

//@rout GET api/posts
//@desc get all post
//access private
const getUserPosts = async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("server error");
  }
};

//@rout Post api/posts
//@desc create a user post
//access private
const createUserPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });
    const post = await newPost.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).json("server error");
  }
};

//@rout GET api/posts/:post_id
//@desc get a post by id
//access private
const getaUserPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.status(500).json("server error");
  }
};

//@rout DELETE api/posts/:post_id
//@desc delete a post
//access private
const deleteUserPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if owner is deleting
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: " user not authorized" });
    }
    post.remove();
    res.json("post removed");
  } catch (error) {
    console.error(error.message);
    res.status(500).json("server error");
  }
};

//@rout PUT api/posts/like/:id
//@desc like and unlike a post
//access private

const likeUserPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post is already liked
    if (
      post.likes.filter((item) => item.user.toString() === req.user.id)
        .length === 0
    ) {
      post.likes.unshift({ user: req.user.id });
    } else {
      post.likes.pop({ user: req.user.id });
    }
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

//@rout Post api/comment:id
//@desc create a user comment
//access private
const createUserComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    };

    post.comments.unshift(newComment);

    await post.save();

    res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

//@rout Post api/delete:id/coment_id
//@desc delete a user comment
//access private
const deleteUserComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //pull out comment form the post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exis
    if (!comment) {
      return res.status(400).json({ msg: "comment does not exist" });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: "user not authorized" });
    }
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json("server error");
  }
};

module.exports = {
  getUserPosts,
  createUserPost,
  getaUserPost,
  deleteUserPosts,
  likeUserPost,
  createUserComment,
  deleteUserComment,
};
