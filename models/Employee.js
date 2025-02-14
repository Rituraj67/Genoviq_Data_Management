// models/Company.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.STRING, allowNull: false, unique: true }, // Custom company-given ID
  name: { type: DataTypes.STRING, allowNull: false },
  regionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Regions', key: 'id' } },
  image: {
    type: DataTypes.STRING, // Stores the URL of the logo
    allowNull: true, // Allow null if no logo is uploaded
    validate: {
      isUrl: true, // Ensures it's a valid URL
    },
  },
});

export default Employee;