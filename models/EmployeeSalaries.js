import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const EmployeeSalaries = sequelize.define('EmployeeSalaries', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Employees', key: 'id' } },
  salary: { type: DataTypes.FLOAT, allowNull: false },
  expenses: { type: DataTypes.FLOAT, defaultValue: 0 },
  target: { type: DataTypes.FLOAT, defaultValue: 0 },
  sale: { type: DataTypes.FLOAT, defaultValue: 0 },
  CRM: { type: DataTypes.FLOAT, defaultValue: 0 },
  other_expenses: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_manufacturing_cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
  indexes: [
    { unique: true, fields: ['employeeId', 'month', 'year'] } 
  ]
});

export default EmployeeSalaries