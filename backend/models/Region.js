import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Region = sequelize.define('Region', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  managerId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Managers', key: 'id' } },
});

export default Region;