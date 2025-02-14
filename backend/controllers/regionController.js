
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "../models/Employee.js";
import EmployeeSalaries from "../models/EmployeeSalaries.js";
import Region from "../models/Region.js";
Employee



const getAllRegion = async (req, res) => {
  try {
    const { managerId } = req.params;

    const regions = await Region.findAll({
      where: { managerId },
      attributes: ["id", "name", "createdAt", "updatedAt"], // Adjust attributes as needed
    });

    if (!regions.length) {
      return res
        .status(404)
        .json({ message: "No regions found for this manager" });
    }

    res.json(regions);
  } catch (error) {
    console.error("Error fetching regions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createRegion = async (req, res) => {
  try {
    const { name, managerId } = req.body;
    const region = await Region.create({ name, managerId });
    res.json(region);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getRegionAnalysisMonthWise = async (req, res) => {
  try {
    const { regionId, startYear, startMonth, endYear, endMonth } = req.params;

    const regionData = await EmployeeSalaries.findAll({
      attributes: [
        "year",
        "month",
        [sequelize.fn("SUM", sequelize.col("salary")), "total_employee_salary"],
        [sequelize.fn("SUM", sequelize.col("expenses")), "total_employee_expenses"],
        [sequelize.fn("SUM", sequelize.col("target")), "total_target"],
        [sequelize.fn("SUM", sequelize.col("sale")), "total_sale"],
        [sequelize.fn("SUM", sequelize.col("CRM")), "total_crm"],
        [
          sequelize.fn("SUM", sequelize.col("other_expenses")),
          "total_employee_other_expenses",
        ],
        [
          sequelize.fn("SUM", sequelize.col("total_manufacturing_cost")),
          "total_manufacturing_cost",
        ],
      ],
      include: [
        {
          model: Employee,
          attributes: [],
          where: { regionId }, // Ensures only employees from the given region are considered
        },
      ],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { year: { [Op.gt]: startYear } },
              { year: startYear, month: { [Op.gte]: startMonth } },
            ],
          },
          {
            [Op.or]: [
              { year: { [Op.lt]: endYear } },
              { year: endYear, month: { [Op.lte]: endMonth } },
            ],
          },
        ],
      },
      group: ["year", "month"],
      order: [
        ["year", "ASC"],
        ["month", "ASC"],
      ],
    });

    if (!regionData || regionData.length === 0) {
      return res.status(404).json({
        error: "No data found for this region within the given time range",
      });
    }

    res.json({ regionId, monthlyData: regionData });
  } catch (error) {
    console.error("Error fetching monthly region analysis:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getRegionAnalysisOverall = async (req, res) => {
  try {
    const { regionId, startYear, startMonth, endYear, endMonth } = req.params;

    const region = await Region.findOne({
      where: { id: regionId },
      attributes: [
        "id",
        "name",
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
          "total_employee_salary",
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
          "total_employee_expenses",
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
          "total_target",
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
          "total_sale",
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
          "total_crm",
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
          "total_employee_other_expenses",
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
          "total_manufacturing_cost",
        ],
      ],
      group: ["Region.id"],
    });

    if (!region) {
      return res.status(404).json({ error: "Region not found" });
    }

    res.json(region );
  } catch (error) {
    console.error("Error fetching region analysis:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  createRegion,
  getAllRegion,
  getRegionAnalysisMonthWise,
  getRegionAnalysisOverall,
};
