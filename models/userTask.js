const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// We reference the associations in an index or individually, but here we can just define the raw model
const UserTask = sequelize.define("userTask", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    downloadedMedia: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true
});

module.exports = UserTask;
