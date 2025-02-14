// Import dependencies
const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const moment = require('moment');

// Initialize Express app
const app = express();
app.use(express.json());

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize('postgres://postgres:Rituraj@672@localhost:5432/genoviq_analysis', {
  dialect: 'postgres',
  logging: false,
});

// Define Models
const Company = sequelize.define('Company', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
});

const Manager = sequelize.define('Manager', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  companyId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Companies', key: 'id' } }
});

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


  

const Region = sequelize.define('Region', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  managerId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Managers', key: 'id' } },
});



const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.STRING, allowNull: false, unique: true }, // Custom company-given ID
  name: { type: DataTypes.STRING, allowNull: false },
  regionId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Regions', key: 'id' } }
});

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
    { unique: true, fields: ['employeeId', 'month', 'year'] } // Ensures no duplicate salary for the same month
  ]
});




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


// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database & tables created!');
});


app.get("/", async(req,res)=>{
    res.send("Hello from genoviq analysis!")
})

app.get('/companies', async (req, res) => {
  try {
    const companies = await Company.findAll({
      attributes: ['id', 'name', 'createdAt', 'updatedAt'] // Adjust attributes as needed
    });

    res.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/companies/:companyId/managers', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Find managers of the specified company
    const managers = await Manager.findAll({
      where: { companyId },
        attributes: ['id', 'name', 'createdAt', 'updatedAt'], // Adjust attributes as needed
    });

    if (!managers.length) {
      return res.status(404).json({ message: 'No managers found for this company' });
    }

    res.json({ managers });
  } catch (error) {
    console.error('Error fetching managers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/managers/:managerId/regions', async (req, res) => {
  try {
    const { managerId } = req.params;

    // Find regions under the specified manager
    const regions = await Region.findAll({
      where: { managerId },
      attributes: ['id', 'name', 'createdAt', 'updatedAt'], // Adjust attributes as needed
    });

    if (!regions.length) {
      return res.status(404).json({ message: 'No regions found for this manager' });
    }

    res.json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/regions/:regionId/employees', async (req, res) => {
  try {
    const { regionId } = req.params;

    // Find employees in the specified region
    const employees = await Employee.findAll({
      where: { regionId },
      attributes: ['id', 'name','employeeId', 'createdAt', 'updatedAt'], // Adjust attributes as needed
    });

    if (!employees.length) {
      return res.status(404).json({ message: 'No employees found in this region' });
    }

    res.json({ employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/employees/:employeeId/salaries/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    let { employeeId, startYear, startMonth, endYear, endMonth } = req.params;

    // Convert params to numbers
    startYear = parseInt(startYear, 10);
    startMonth = parseInt(startMonth, 10);
    endYear = parseInt(endYear, 10);
    endMonth = parseInt(endMonth, 10);

    if (!startYear || !startMonth || !endYear || !endMonth) {
      return res.status(400).json({ error: 'Start and end year/month must be valid numbers' });
    }

    const salaries = await EmployeeSalaries.findAll({
      where: {
        employeeId,
        [Op.and]: [
          Sequelize.literal(`(year * 12 + month) >= (${startYear} * 12 + ${startMonth})`),
          Sequelize.literal(`(year * 12 + month) <= (${endYear} * 12 + ${endMonth})`)
        ]
      },
      attributes: [
        'id', 'salary', 'expenses', 'target', 'sale', 'CRM', 
        'other_expenses', 'total_manufacturing_cost', 'month', 'year', 'createdAt'
      ],
      order: [['year', 'ASC'], ['month', 'ASC']], // Latest records first
    });

    if (!salaries.length) {
      return res.status(404).json({ message: 'No salary records found for this employee in the given range' });
    }

    res.json(salaries);
  } catch (error) {
    console.error('Error fetching employee salary records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// API to add a company
app.post('/company', async (req, res) => {
  const { name } = req.body;
  const company = await Company.create({ name });
  res.json(company);
});


// API to add a manager
app.post('/manager', async (req, res) => {
  const { name, companyId } = req.body;
  const manager = await Manager.create({ name, companyId });
  res.json(manager);
});


// API to add a region
app.post('/region', async (req, res) => {
  const { name, managerId } = req.body;
  const region = await Region.create({ name, managerId });
  res.json(region);
});



// API to add an employee
app.post('/employee', async (req, res) => {
  const { employeeId, name, regionId } = req.body;

  try {
    if (!employeeId || !name || !regionId) {
      return res.status(400).json({ error: "employeeId, name, and regionId are required" });
    }

    // Check if employee with the same employeeId already exists
    const existingEmployee = await Employee.findOne({ where: { employeeId } });

    if (existingEmployee) {
      return res.status(400).json({ error: "Employee with this employeeId already exists" });
    }

    // Create new employee record
    const employee = await Employee.create({ employeeId, name, regionId });

    res.json({ employee, message: "Employee created successfully" });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/employee/salary', async (req, res) => {
  const { employeeId,managerId, salary, expenses, target, sale, CRM, other_expenses, total_manufacturing_cost, month, year } = req.body;

  try {
    if (!employeeId || !month || !year || !salary) {
      return res.status(400).json({ error: "employeeId, month, year, and salary are required" });
    }

    // ✅ Step 1: Add/Update Employee Salary
    const [employeeSalary, created] = await EmployeeSalaries.findOrCreate({
      where: { employeeId, month, year },
      defaults: { salary, expenses, target, sale, CRM, other_expenses, total_manufacturing_cost }
    });

    if (!created) {
      // If exists, update salary, expenses & performance data
      await employeeSalary.update({ salary, expenses, target, sale, CRM, other_expenses, total_manufacturing_cost });
    }

    // ✅ Step 2: Find the Manager of the Employee

    // ✅ Step 3: Check if Manager's Salary Exists for This Month
    const managerSalaryEntry = await ManagerSalaries.findOne({ where: { managerId, month, year } });

    if (!managerSalaryEntry) {
      // Fetch the last recorded salary of this manager
      const lastManagerSalary = await ManagerSalaries.findOne({
        where: { managerId },
        order: [['year', 'DESC'], ['month', 'DESC']]
      });
      console.log(lastManagerSalary);

      let managerSalary = lastManagerSalary ? lastManagerSalary.salary : null;
      // let managerExpenses = lastManagerSalary ? lastManagerSalary.expenses : 0;

      if (!managerSalary) {
        return res.status(400).json({ error: "No previous manager salary found. Please enter a salary manually." });
      }

      // ✅ Step 4: Create Manager's Salary for This Month
      await ManagerSalaries.create({
        managerId, month, year, salary: managerSalary,
      });
    }

    res.json({
      employeeSalary,
      message: !managerSalaryEntry
        ? 'Employee salary added, manager salary checked/created'
        : 'Employee salary updated, manager salary checked/created'
    });

  } catch (error) {
    console.error('Error adding/updating employee/manager salary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Aggregation API for Region Level Analysis
app.get('/overallanalysis/region/:regionId/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    const { regionId, startYear, startMonth, endYear, endMonth } = req.params;

    const region = await Region.findOne({
      where: { id: regionId },
      attributes: [
        'id', 'name',
        // Total Salary
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.salary), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_salary'
        ],
        // Total Expenses
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.expenses), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_expenses'
        ],
        // Total Target
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.target), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_target'
        ],
        // Total Sales
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.sale), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_sales'
        ],
        // Total CRM
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es."CRM"), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_CRM'
        ],
        // Other Expenses
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.other_expenses), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_other_expenses'
        ],
        // Total Manufacturing Cost
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.total_manufacturing_cost), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            WHERE e."regionId" = "Region"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_manufacturing_cost'
        ]
      ],
      group: ['Region.id']
    });

    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json({ region });
  } catch (error) {
    console.error('Error fetching region analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




  

// Aggregation API for Manager Level Analysis
app.get('/overallanalysis/manager/:managerId/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    const { managerId, startYear, startMonth, endYear, endMonth } = req.params;

    const manager = await Manager.findOne({
      where: { id: managerId },
      attributes: [
        'id', 'name',
        // Manager salary
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(ms.salary), 0) 
            FROM "ManagerSalaries" AS ms 
            WHERE ms."managerId" = "Manager"."id"
            AND (ms.year > ${startYear} OR (ms.year = ${startYear} AND ms.month >= ${startMonth}))
            AND (ms.year < ${endYear} OR (ms.year = ${endYear} AND ms.month <= ${endMonth}))
          )`),
          'manager_salary'
        ],
        // Manager expenses
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(ms.expenses), 0) 
            FROM "ManagerSalaries" AS ms 
            WHERE ms."managerId" = "Manager"."id"
            AND (ms.year > ${startYear} OR (ms.year = ${startYear} AND ms.month >= ${startMonth}))
            AND (ms.year < ${endYear} OR (ms.year = ${endYear} AND ms.month <= ${endMonth}))
          )`),
          'manager_expenses'
        ],
        // Employee salary
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.salary), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'employee_salary'
        ],
        // Employee expenses
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.expenses), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'employee_expenses'
        ],
        // Total target
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.target), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_target'
        ],
        // Total sales
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.sale), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_sales'
        ],
        // CRM
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es."CRM"), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_CRM'
        ],
        // Other expenses
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.other_expenses), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_other_expenses'
        ],
        // Manufacturing cost
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.total_manufacturing_cost), 0) 
            FROM "EmployeeSalaries" AS es
            JOIN "Employees" AS e ON es."employeeId" = e.id
            JOIN "Regions" AS r ON e."regionId" = r.id
            WHERE r."managerId" = "Manager"."id"
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth}))
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_manufacturing_cost'
        ]
      ],
      group: ['Manager.id']
    });

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    res.json({ manager });
  } catch (error) {
    console.error('Error fetching manager analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



  

// Aggregation API for Company Level Analysis
app.get('/overallanalysis/company/:companyId/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    const { companyId, startYear, startMonth, endYear, endMonth } = req.params;

    const company = await Company.findOne({
      where: { id: companyId },
      attributes: [
        'id', 'name',
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(ms.salary), 0) 
            FROM "ManagerSalaries" AS ms 
            JOIN "Managers" AS m ON ms."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (ms.year > ${startYear} OR (ms.year = ${startYear} AND ms.month >= ${startMonth})) 
            AND (ms.year < ${endYear} OR (ms.year = ${endYear} AND ms.month <= ${endMonth}))
          )`),
          'total_manager_salary'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(ms.expenses), 0) 
            FROM "ManagerSalaries" AS ms 
            JOIN "Managers" AS m ON ms."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (ms.year > ${startYear} OR (ms.year = ${startYear} AND ms.month >= ${startMonth})) 
            AND (ms.year < ${endYear} OR (ms.year = ${endYear} AND ms.month <= ${endMonth}))
          )`),
          'total_manager_expenses'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.salary), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_employee_salary'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.expenses), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_employee_expenses'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.target), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_target'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.sale), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_sale'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es."CRM"), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_CRM'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.other_expenses), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_employee_other_expenses'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(es.total_manufacturing_cost), 0) 
            FROM "EmployeeSalaries" AS es 
            JOIN "Employees" AS e ON es."employeeId" = e.id 
            JOIN "Regions" AS r ON e."regionId" = r.id 
            JOIN "Managers" AS m ON r."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (es.year > ${startYear} OR (es.year = ${startYear} AND es.month >= ${startMonth})) 
            AND (es.year < ${endYear} OR (es.year = ${endYear} AND es.month <= ${endMonth}))
          )`),
          'total_manufacturing_cost'
        ]
      ],
      group: ['Company.id']
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Error fetching company analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/monthlyanalysis/region/:regionId/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    const { regionId, startYear, startMonth, endYear, endMonth } = req.params;

    const regionData = await EmployeeSalaries.findAll({
      attributes: [
        'year', 
        'month',
        [sequelize.fn('SUM', sequelize.col('salary')), 'total_salary'],
        [sequelize.fn('SUM', sequelize.col('expenses')), 'total_expenses'],
        [sequelize.fn('SUM', sequelize.col('target')), 'total_target'],
        [sequelize.fn('SUM', sequelize.col('sale')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('CRM')), 'total_CRM'],
        [sequelize.fn('SUM', sequelize.col('other_expenses')), 'total_other_expenses'],
        [sequelize.fn('SUM', sequelize.col('total_manufacturing_cost')), 'total_manufacturing_cost']
      ],
      include: [
        {
          model: Employee,
          attributes: [],
          where: { regionId } // Ensures only employees from the given region are considered
        }
      ],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { year: { [Op.gt]: startYear } },
              { year: startYear, month: { [Op.gte]: startMonth } }
            ]
          },
          {
            [Op.or]: [
              { year: { [Op.lt]: endYear } },
              { year: endYear, month: { [Op.lte]: endMonth } }
            ]
          }
        ]
      },
      group: ['year', 'month'],
      order: [['year', 'ASC'], ['month', 'ASC']]
    });

    if (!regionData || regionData.length === 0) {
      return res.status(404).json({ error: 'No data found for this region within the given time range' });
    }

    res.json({ regionId, monthlyData: regionData });
  } catch (error) {
    console.error('Error fetching monthly region analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




  

// Aggregation API for Manager Level Analysis
app.get('/monthlyanalysis/manager/:managerId/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    const { managerId, startYear, startMonth, endYear, endMonth } = req.params;

    const monthlyData = await sequelize.query(
      `SELECT ms.year, ms.month,
        COALESCE(MAX(ms.salary), 0) AS manager_salary,
        COALESCE(MAX(ms.expenses), 0) AS manager_expenses,
        COALESCE(SUM(es.salary), 0) AS employee_salary,
        COALESCE(SUM(es.expenses), 0) AS employee_expenses,
        COALESCE(SUM(es.target), 0) AS total_target,
        COALESCE(SUM(es.sale), 0) AS total_sales,
        COALESCE(SUM(es."CRM"), 0) AS total_CRM,
        COALESCE(SUM(es.other_expenses), 0) AS total_other_expenses,
        COALESCE(SUM(es.total_manufacturing_cost), 0) AS total_manufacturing_cost
      FROM "ManagerSalaries" AS ms
      LEFT JOIN "Employees" AS e ON e."regionId" IN (
        SELECT r.id FROM "Regions" AS r WHERE r."managerId" = :managerId
      )
      LEFT JOIN "EmployeeSalaries" AS es ON es."employeeId" = e.id AND es.year = ms.year AND es.month = ms.month
      WHERE ms."managerId" = :managerId
      AND (ms.year > :startYear OR (ms.year = :startYear AND ms.month >= :startMonth))
      AND (ms.year < :endYear OR (ms.year = :endYear AND ms.month <= :endMonth))
      GROUP BY ms.year, ms.month
      ORDER BY ms.year, ms.month`,
      {
        replacements: { managerId, startYear, startMonth, endYear, endMonth },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!monthlyData.length) {
      return res.status(404).json({ error: 'No data found for the specified period' });
    }

    res.json({ managerId, monthlyData });
  } catch (error) {
    console.error('Error fetching manager analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





  

// Aggregation API for Company Level Analysis
app.get('/monthlyanalysis/company/:companyId/:startYear/:startMonth/:endYear/:endMonth', async (req, res) => {
  try {
    const { companyId, startYear, startMonth, endYear, endMonth } = req.params;

    const monthlyData = await sequelize.query(
      `SELECT ms.year, ms.month,
        COALESCE(SUM(DISTINCT ms.salary), 0) AS total_manager_salary,
        COALESCE(SUM(DISTINCT ms.expenses), 0) AS total_manager_expenses,
        COALESCE(SUM(es.salary), 0) AS total_employee_salary,
        COALESCE(SUM(es.expenses), 0) AS total_employee_expenses,
        COALESCE(SUM(es.target), 0) AS total_target,
        COALESCE(SUM(es.sale), 0) AS total_sale,
        COALESCE(SUM(es."CRM"), 0) AS total_CRM,
        COALESCE(SUM(es.other_expenses), 0) AS total_employee_other_expenses,
        COALESCE(SUM(es.total_manufacturing_cost), 0) AS total_manufacturing_cost
      FROM "Companies" AS c
      LEFT JOIN "Managers" AS m ON m."companyId" = c.id
      LEFT JOIN "ManagerSalaries" AS ms ON ms."managerId" = m.id
      LEFT JOIN "Regions" AS r ON r."managerId" = m.id
      LEFT JOIN "Employees" AS e ON e."regionId" = r.id
      LEFT JOIN "EmployeeSalaries" AS es ON es."employeeId" = e.id AND es.year = ms.year AND es.month = ms.month
      WHERE c.id = :companyId
      AND (ms.year > :startYear OR (ms.year = :startYear AND ms.month >= :startMonth))
      AND (ms.year < :endYear OR (ms.year = :endYear AND ms.month <= :endMonth))
      GROUP BY ms.year, ms.month
      ORDER BY ms.year, ms.month`,
      {
        replacements: { companyId, startYear, startMonth, endYear, endMonth },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!monthlyData.length) {
      return res.status(404).json({ error: 'No data found for the specified period' });
    }

    res.json({ companyId, monthlyData });
  } catch (error) {
    console.error('Error fetching company analysis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





  

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
