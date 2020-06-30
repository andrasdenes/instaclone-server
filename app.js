const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv/config");
require("./models/user");

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

//Routes
const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

//MW
app.use(express.json());

//Listen
app.listen(port, () => {
  console.log("Listening on port: " + port + " ....");
});
