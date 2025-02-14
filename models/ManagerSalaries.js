import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';


const ManagerSalaries = sequelize.define('ManagerSalaries', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  managerId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Managers', key: 'id' } },
  salary: { type: DataTypes.FLOAT, allowNull: false },
  expenses: { type: DataTypes.FLOAT, defaultValue: 0 }, // Monthly expenses
  month: { type: DataTypes.INTEGER, allowNull: false }, // Stores salary for a specific month
  year: { type: DataTypes.INTEGER, allowNull: false }, 
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
  indexes: [
    { unique: true, fields: ['managerId', 'month', 'year'] } // Ensures no duplicate salary for the same month
  ]
});

export default ManagerSalaries;