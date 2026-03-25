const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("product", {
    images: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    videoLink: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    colors: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    attachedImages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    attachedVideos: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
}, {
    timestamps: true
});

module.exports = Product;
