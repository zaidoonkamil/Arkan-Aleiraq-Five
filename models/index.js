const User = require("./user");
const UserDevice = require("./user_device");
const NotificationLog = require("./notification_log");
const Product = require("./product");
const UserTask = require("./userTask");
const Details = require("./details");

User.hasMany(UserDevice, { foreignKey: 'user_id', as: 'devices', onDelete: 'CASCADE' });
UserDevice.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

User.hasMany(UserTask, { foreignKey: 'userId', as: 'tasks', onDelete: 'CASCADE' });
UserTask.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(UserTask, { foreignKey: 'productId', as: 'tasks', onDelete: 'CASCADE' });
UserTask.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  User,
  UserDevice,
  NotificationLog,
  Product,
  UserTask,
  Details,
};
