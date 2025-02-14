// models/Company.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Company = sequelize.define("Company", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING, // Stores the URL of the logo
    allowNull: true, // Allow null if no logo is uploaded
    validate: {
      isUrl: true, // Ensures it's a valid URL
    },
  },
});

export default Company;
