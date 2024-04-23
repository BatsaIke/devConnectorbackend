const { validationResult } = require("express-validator");
const Profile = require("../model/Profiles.js");
const User = require("../model/UserModel.js");
const Post = require("../model/Posts.js")
const request = require("request");
const config = require("config");
const { options } = require("../routes/usersRoute.js");
const { json } = require("express");

//@rout GET api/profiles/me
//@desc Get current user's profile
//access private
const getUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.send(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
};

//@rout POST api/profile
//@desc create or update user's profile
//access private
const createUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedIn,
  } = req.body;
  //build profile object
  const profileFieledd = {};
  profileFieledd.user = req.user.id;
  if (company) profileFieledd.company = company;
  if (website) profileFieledd.website = website;
  if (location) profileFieledd.location = location;
  if (bio) profileFieledd.bio = bio;
  if (status) profileFieledd.status = status;
  if (githubusername) profileFieledd.githubusername = githubusername;
  if (skills) {
    profileFieledd.skills = skills.split(",").map((skill) => skill.trim());
  }
  //build social objects
  profileFieledd.social = {};
  if (youtube) profileFieledd.social.youtube = youtube;
  if (twitter) profileFieledd.social.twitter = twitter;
  if (facebook) profileFieledd.social.facebook = facebook;
  if (linkedIn) profileFieledd.social.linkedIn = linkedIn;
  if (instagram) profileFieledd.socialinstagram = instagram;
  try {
    //find the profile
    let profile = await Profile.findOne({ user: req.user.id });
    //if it exist updated it
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFieledd },
        { new: true }
      );
      return res.json(profile);
    } else {
      //if it doesnt exist create
      profile = new Profile(profileFieledd);
      await profile.save();
      return res.json(profile);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

//@rout GET api/profile
//@desc get all profiles
//access public

const getAllProfiles = async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

//@rout GET api/profile/user/:user_id
//@desc get a profile
//access public
const getSingleProfiles = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "No profile for selected user" });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "No profile for selected user" });
    }
    res.status(500).send("Server error");
  }
};

//@rout DELETE api/profile/
//@desc delete a profile, user and post
//access private
const deleteAProfile = async (req, res) => {
  try {
    // Remove user posts
    // Remove profile
    // Remove user
    await Promise.all([
      Post.deleteMany({ user: req.user.id }),
      Profile.findOneAndRemove({ user: req.user.id }),
      User.findOneAndRemove({ _id: req.user.id })
    ]);

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

//@rout PUT api/profile/experince
//@desc adds profile experince
//access private
const updateAProfileExperience = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, company, location, from, to, current, description } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description,
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

//@rout DELETE api/profile/experince/:exp_id
//@desc delete a profile, experince
//access private
const deleteAProfileExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.json(500).send("Server error");
  }
};

//@rout PUT api/profile/education
//@desc adds profile education
//access private
const updateAProfileEducation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { school, degree, fieldofstudy, from, to, current, description } =
    req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  };

  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

//@rout DELETE api/profile/education/:edu_id
//@desc delete a profile, education
//access private
const deleteAProfileEducation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get the remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.json(500).send("Server error");
  }
};

//@rout GET api/profile/github/:username
//@desc get user repos from github
//access public
const getGithubRepo = async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5$sort=created:asc&client_id${config.get(
        "githubClientId"
      )}&client_secret${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error.message);
      if (response.statusCode !== 200) {
       return res.status(404).json({ msg: "no profile found" });
      }
     return res.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json("server error");
  }
};
module.exports = {
  getUserProfile,
  createUserProfile,
  getAllProfiles,
  getSingleProfiles,
  deleteAProfile,
  updateAProfileExperience,
  deleteAProfileExperience,
  updateAProfileEducation,
  deleteAProfileEducation,
  getGithubRepo,
};
