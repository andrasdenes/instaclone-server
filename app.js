const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");

//PORT
const port = process.env.PORT || 5000;

//DB
mongoose.connect(
  process.env.MONGOURI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Connected to DB on Atlas");
  }
);

mongoose.connection.on("error", (err) => {
  console.log("error connecting", err);
});

//Models
require("./models/user");
require("./models/post");

//MW
app.use(express.json());

//Routes
const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

const postRoute = require("./routes/post");
app.use("/post", postRoute);

//Listen
app.listen(port, () => {
  console.log("Listening on port: " + port + " ....");
});
