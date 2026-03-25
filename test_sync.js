const sequelize = require("./config/db");
const models = require("./models");

sequelize.sync({ force: false })
  .then(() => {
    console.log("✅ Sync successful!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Sync error:", err);
    process.exit(1);
  });
