const express = require("express");
const connectDB = require("./config/db.js");
const usersDetails = require("./routes/usersRoute.js");
const userPosts = require("./routes/postRoute.js");
const userProfile = require("./routes/profilesRoute.js");
const userAuth = require("./routes/authRoute.js");
const cors = require("cors");

const app = express();
//connect database
connectDB();
//init middleware 
app.use(express.json({ extended: false }));
app.options('*', cors()); // Enable preflight for all routes

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
);
//define routes
app.use("/api/v1/users", usersDetails); 
app.use("/api/v1/posts", userPosts);
app.use("/api/v1/profile", userProfile); 
app.use("/api/v1/auth", userAuth); 

const PORT = process.env.PORT || 5100;
app.get("/", (req, res) => res.send("Api is running"));
app.listen(PORT, () => console.log(`Servver is listening on port: ${PORT}`)); 
