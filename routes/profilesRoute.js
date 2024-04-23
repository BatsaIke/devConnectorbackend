const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const { check } = require("express-validator");

const {
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
} = require("../controller/profilesController.js");
const { route } = require("./usersRoute.js");

router.route("/me").get(auth, getUserProfile);

//gets all profiles
router.route("/").get(getAllProfiles);

//post route to create profile
router
  .route("/")
  .post(
    [
      auth,
      [
        check("status", "status is required").not().isEmpty(),
        check("skills", "skills is required").not().isEmpty(),
      ],
    ],
    createUserProfile
    //delete a profile
  )
  .delete(auth, deleteAProfile);

//add experince to profile
router
  .route("/experience")
  .put(
    [
      auth,
      [
        check("title", "Title is required").not().isEmpty(),
        check("company", "Company is required").not().isEmpty(),
        check("from", "From date is required").not().isEmpty(),
      ],
    ],
    updateAProfileExperience
  );

//get a single profile
router.route("/user/:user_id").get(getSingleProfiles);

//deletes experince from profile
router.route("/experience/:exp_id").delete(auth, deleteAProfileExperience);

//add profile education
router
  .route("/education")
  .put(
    [
      auth,
      [
        check("school", "School is required").not().isEmpty(),
        check("degree", "Degree is required").not().isEmpty(),
        check("fieldofstudy", "Field of study is required").not().isEmpty(),
        check("from", "From is required").not().isEmpty(),
      ],
    ],
    updateAProfileEducation 
  );

  //delete profile education
  router.route('/education/:edu_id').delete(auth, deleteAProfileEducation)

  //get github repos
  router.route('/github/:username').get(getGithubRepo)

module.exports = router;
