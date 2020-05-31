const express = require("express");

const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth.routes");
const networkRoutes = require("./routes/network.routes");
const postsRoutes = require("./routes/posts.routes");
const usersRoutes = require("./routes/users.routes");

const app = express();

app.use(bodyParser.json({ limit: "5mb" }));

app.use("/", authRoutes);
app.use("/network", networkRoutes);
app.use("/posts", postsRoutes);
app.use("/users", usersRoutes);

app.listen(process.argv[2], () => {
  console.log(`Api listening on port ${process.argv[2]}...`);
});


