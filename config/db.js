import { Sequelize } from 'sequelize';
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// ✅ Initialize Sequelize first
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// ✅ Export sequelize first
export default sequelize;

// ✅ Define a function to initialize models
const initModels = async () => {
  const { default: Company } = await import('../models/Company.js');
  const { default: Manager } = await import('../models/Manager.js');
  const { default: Region } = await import('../models/Region.js');
  const { default: Employee } = await import('../models/Employee.js');
  const { default: EmployeeSalaries } = await import('../models/EmployeeSalaries.js');
  const { default: ManagerSalaries } = await import('../models/ManagerSalaries.js');
  const { default: User } = await import('../models/User.js'); // ✅ Import User

  // ✅ Define associations AFTER importing models
  Company.hasMany(Manager, { foreignKey: 'companyId' });
  Manager.belongsTo(Company, { foreignKey: 'companyId' });

  Manager.hasMany(Region, { foreignKey: 'managerId' });
  Region.belongsTo(Manager, { foreignKey: 'managerId' });

  Region.hasMany(Employee, { foreignKey: 'regionId' });
  Employee.belongsTo(Region, { foreignKey: 'regionId' });

  Employee.hasMany(EmployeeSalaries, { foreignKey: 'employeeId' });
  EmployeeSalaries.belongsTo(Employee, { foreignKey: 'employeeId' });

  Manager.hasMany(ManagerSalaries, { foreignKey: 'managerId' });
  ManagerSalaries.belongsTo(Manager, { foreignKey: 'managerId' });

  console.log("✅ Models initialized successfully");
};

// ✅ Sync Database only when explicitly called
const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true }); // Only in development
      console.log("✅ Database & tables synced successfully!");
    } else {
      console.log("⚠️ Skipping database sync in production. Use migrations instead.");
    }
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
};


export { initModels, syncDatabase };
