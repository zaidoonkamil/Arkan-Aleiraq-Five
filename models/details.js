const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Details = sequelize.define("details", {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    timestamps: true
});

module.exports = Details;
