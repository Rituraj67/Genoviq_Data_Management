import { uploadToCloudinary } from "../config/cloudinary.js";
import sequelize from "../config/db.js";
import Manager from "../models/Manager.js";
import ManagerSalaries from "../models/ManagerSalaries.js";



const getAllManager = async (req, res) => {
  try {
    const { companyId } = req.params;
    const managers = await Manager.findAll({
      where: { companyId },
      attributes: { exclude: ["createdAt", "updatedAt"] }, // Adjust attributes as needed
    });

    if (!managers.length) {
      return res
        .status(404)
        .json({ message: "No managers found for this company" });
    }

    res.json( managers );
  } catch (error) {
    console.error("Error fetching managers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createManager = async (req, res) => {
  const { name, companyId } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result= await uploadToCloudinary(req.file.buffer)

    const manager = await Manager.create({ name, companyId, image: result.croppedUrl });
    res.json(manager);
  } catch (error) {
    console.error("Error creating manager:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createManagerSalary = async (req, res) => {
  let { managerId, salary, expenses, month, year } = req.body;

  salary= parseFloat(salary)
  expenses= parseFloat(expenses)
  month=parseInt(month)
  year=parseInt(year)



  try {
    if (!managerId || !month || !year || !salary) {
      return res
        .status(400)
        .json({ error: "managerId, month, year, and salary are required" });
    }

    // Check if salary entry already exists for this month
    const [managerSalary, created] = await ManagerSalaries.findOrCreate({
      where: { managerId, month, year },
      defaults: { salary, expenses },
    });

    if (!created) {
      // If exists, update salary and expenses
      await managerSalary.update({ salary, expenses });
    }

    res.json({
      managerSalary,
      message: created ? "Manager salary added" : "Manager salary updated",
    });
  } catch (error) {
    console.error("Error adding/updating manager salary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getManagerAnalysisMonthWise = async (req, res) => { 
  try {
    const { managerId, startYear, startMonth, endYear, endMonth } = req.params;

    const monthlyData = await sequelize.query(
      `SELECT ms.year, ms.month,
        COALESCE(MAX(ms.salary), 0) AS manager_salary,
        COALESCE(MAX(ms.expenses), 0) AS manager_expenses,
        COALESCE(SUM(es.salary), 0) AS total_employee_salary,
        COALESCE(SUM(es.expenses), 0) AS total_employee_expenses,
        COALESCE(SUM(es.target), 0) AS total_target,
        COALESCE(SUM(es.sale), 0) AS total_sale,
        COALESCE(SUM(es."CRM"), 0) AS total_CRM,
        COALESCE(SUM(es.other_expenses), 0) AS total_employee_other_expenses,
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
};


const getManagerAnalysisOverall = async (req, res) => {
  try {
    const { managerId, startYear, startMonth, endYear, endMonth } = req.params;

    const manager = await Manager.findOne({
      where: { id: managerId },
      attributes: [
        "id",
        "name",
        // Manager salary
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(ms.salary), 0) 
            FROM "ManagerSalaries" AS ms 
            WHERE ms."managerId" = "Manager"."id"
            AND (ms.year > ${startYear} OR (ms.year = ${startYear} AND ms.month >= ${startMonth}))
            AND (ms.year < ${endYear} OR (ms.year = ${endYear} AND ms.month <= ${endMonth}))
          )`),
          "manager_salary",
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
          "manager_expenses",
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
          "total_employee_salary",
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
          "total_employee_expenses",
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
          "total_target",
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
          "total_sale",
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
          "total_crm",
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
          "total_employee_other_expenses",
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
          "total_manufacturing_cost",
        ],
      ],
      group: ["Manager.id"],
    });

    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    res.json(manager );
  } catch (error) {
    console.error("Error fetching manager analysis:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  getAllManager,
  createManager,
  getManagerAnalysisOverall,
  getManagerAnalysisMonthWise,
  createManagerSalary,
};
