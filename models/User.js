// models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING, // Use STRING for flexibility (+91, 0 prefix, etc.)
    allowNull: false,
    unique: true // Ensures no duplicate phone numbers
  }
});

export default User;
