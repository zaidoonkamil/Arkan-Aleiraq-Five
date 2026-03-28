const express = require("express");
const sequelize = require("./config/db");
const usersRouter = require("./routes/user");
const notifications = require("./routes/notifications");
const adsRouter = require("./routes/ads");
const productRouter = require("./routes/product");
const userTaskRouter = require("./routes/userTask");
const detailsRouter = require("./routes/details");

const app = express();
app.use(express.json());
app.use("/uploads", express.static("./" + "uploads"));

sequelize.sync({
    force: false ,
 }).then(() => console.log("✅ Database & User table synced!"))
  .catch(err => console.error("❌ Error syncing database:", err));


app.use("/", usersRouter);
app.use("/", notifications);
app.use("/", adsRouter);
app.use("/", productRouter);
app.use("/", userTaskRouter);
app.use("/", detailsRouter);

app.listen( 1005 , () => {
    console.log(`🚀 Server running on http://localhost:1005`);
});