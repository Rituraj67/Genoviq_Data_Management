import { uploadToCloudinary } from "../config/cloudinary.js";
import sequelize from "../config/db.js";
import Company from "../models/Company.js";

const getAllCompanies = async (req, res) => {

  try {
    const companies = await Company.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] }, 
    });
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createCompany = async (req, res) => {
  const { name } = req.body;
  console.log(req.file);
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result= await uploadToCloudinary(req.file.buffer);
    const company = await Company.create({ name, logo: result.croppedUrl });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCompanyAnalysisMonthWise = async (req, res) => {
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
        COALESCE(SUM(es."CRM"), 0) AS total_crm,
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
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!monthlyData.length) {
      return res
        .status(404)
        .json({ error: "No data found for the specified period" });
    }

    res.json({ companyId, monthlyData });
  } catch (error) {
    console.error("Error fetching company analysis:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCompanyAnalysisOverall = async (req, res) => {
  try {
    const { companyId, startYear, startMonth, endYear, endMonth } = req.params;

    const company = await Company.findOne({
      where: { id: companyId },
      attributes: [
        "id",
        "name",
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(ms.salary), 0) 
            FROM "ManagerSalaries" AS ms 
            JOIN "Managers" AS m ON ms."managerId" = m.id 
            WHERE m."companyId" = "Company".id 
            AND (ms.year > ${startYear} OR (ms.year = ${startYear} AND ms.month >= ${startMonth})) 
            AND (ms.year < ${endYear} OR (ms.year = ${endYear} AND ms.month <= ${endMonth}))
          )`),
          "total_manager_salary",
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
          "total_manager_expenses",
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
          "total_employee_salary",
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
          "total_employee_expenses",
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
          "total_target",
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
          "total_sale",
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
          "total_crm",
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
          "total_employee_other_expenses",
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
          "total_manufacturing_cost",
        ],
      ],
      group: ["Company.id"],
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(company );
  } catch (error) {
    console.error("Error fetching company analysis:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default { getAllCompanies, createCompany, getCompanyAnalysisMonthWise, getCompanyAnalysisOverall };
