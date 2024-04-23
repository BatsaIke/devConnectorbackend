const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth.js')
const { check} = require("express-validator");

const {
 getUserPosts,
 createUserPost,
 deleteUserPosts,
 getaUserPost,
 likeUserPost,
 createUserComment,
 deleteUserComment

} = require("../controller/postsController.js");

//get all post
router.route("/")
.get(auth,getUserPosts)

//create a post
.post([auth,
    [
    check('text','text is required').not().isEmpty()
]
], createUserPost) 

//get a sigle post
router.route('/:id').get(auth, getaUserPost)
//delete a single post
.delete(auth, deleteUserPosts)

//like a post and unlike
router.route('/like/:id').put(auth, likeUserPost)

router
  .route("/comment/:id")
  //create a comment
  .post(
    [auth, [check("text", "text is required").not().isEmpty()]],
    createUserComment
  )
 

  router
    .route("/comment/:id/:comment_id")
    .delete(auth, deleteUserComment);


module.exports = router;
