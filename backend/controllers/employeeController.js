import { Op, Sequelize } from "sequelize";
import Employee from "../models/Employee.js";
import EmployeeSalaries from "../models/EmployeeSalaries.js";
import ManagerSalaries from "../models/ManagerSalaries.js";
import { uploadToCloudinary } from "../config/cloudinary.js";



const getAllEmployee = async (req, res) => {
  try {
    const { regionId } = req.params;

    const employees = await Employee.findAll({
      where: { regionId },
      attributes: { exclude: ["createdAt", "updatedAt"] },  // Adjust attributes as needed
    });

    if (!employees.length) {
      return res
        .status(404)
        .json({ message: "No employees found in this region" });
    }

    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createEmployee = async (req, res) => {
  const { employeeId, name, regionId } = req.body;


  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!employeeId || !name || !regionId) {
      return res
      .status(400)
      .json({ error: "employeeId, name, and regionId are required" });
    }
    
    const existingEmployee = await Employee.findOne({ where: { employeeId } });
    
    if (existingEmployee) {
      return res
      .status(400)
      .json({ error: "Employee with this employeeId already exists" });
    }
    const result= await uploadToCloudinary(req.file.buffer)

    const employee = await Employee.create({ employeeId, name, regionId, image: result.croppedUrl });

    res.json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createEmployeeSalary = async (req, res) => {
  let {
    employeeId,
    managerId,
    salary,
    expenses,
    target,
    sale,
    CRM,
    other_expenses,
    total_manufacturing_cost,
    month,
    year,
  } = req.body;

  salary= parseFloat(salary);
  expenses= parseFloat(expenses);
  target= parseFloat(target);
  sale= parseFloat(sale);
  CRM= parseFloat(CRM);
  other_expenses= parseFloat(other_expenses)
  total_manufacturing_cost= parseFloat(total_manufacturing_cost)
  month= parseInt(month)
  year= parseInt(year)

  try {
    if (!employeeId || !month || !year || !salary) {
      return res
        .status(400)
        .json({ error: "employeeId, month, year, and salary are required" });
    }

    // Add/Update Employee Salary
    const [employeeSalary, created] = await EmployeeSalaries.findOrCreate({
      where: { employeeId, month, year },
      defaults: {
        salary,
        expenses,
        target,
        sale,
        CRM,
        other_expenses,
        total_manufacturing_cost,
      },
    });

    if (!created) {
      // If exists, update salary, expenses & performance data
      await employeeSalary.update({
        salary,
        expenses,
        target,
        sale,
        CRM,
        other_expenses,
        total_manufacturing_cost,
      });
    }


    // Check if Manager's Salary Exists for This Month
    const managerSalaryEntry = await ManagerSalaries.findOne({
      where: { managerId, month, year },
    });

    if (!managerSalaryEntry) {
      // Fetch the last recorded salary of this manager
      const lastManagerSalary = await ManagerSalaries.findOne({
        where: { managerId },
        order: [
          ["year", "DESC"],
          ["month", "DESC"],
        ],
      });
      console.log(lastManagerSalary);

      let managerSalary = lastManagerSalary ? lastManagerSalary.salary : 0;

      // Create Manager's Salary for This Month
      await ManagerSalaries.create({
        managerId,
        month,
        year,
        salary: managerSalary,
      });
    }

    res.json({
      employeeSalary,
      message: !managerSalaryEntry
        ? "Employee salary added, manager salary checked/created"
        : "Employee salary updated, manager salary checked/created",
    });
  } catch (error) {
    console.error("Error adding/updating employee/manager salary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getEmployeeAnalysisMonthWise = async (req, res) => {
  try {
    let { employeeId, startYear, startMonth, endYear, endMonth } = req.params;

    // Convert params to numbers
    startYear = parseInt(startYear, 10);
    startMonth = parseInt(startMonth, 10);
    endYear = parseInt(endYear, 10);
    endMonth = parseInt(endMonth, 10);

    if (!startYear || !startMonth || !endYear || !endMonth) {
      return res
        .status(400)
        .json({ error: "Start and end year/month must be valid numbers" });
    }

    const salaries = await EmployeeSalaries.findAll({
      where: {
        employeeId,
        [Op.and]: [
          Sequelize.literal(
            `(year * 12 + month) >= (${startYear} * 12 + ${startMonth})`
          ),
          Sequelize.literal(
            `(year * 12 + month) <= (${endYear} * 12 + ${endMonth})`
          ),
        ],
      },
      attributes: [
        "id",
        "salary",
        "expenses",
        "target",
        ["sale", "total_sale"],
        "CRM",
        "other_expenses",
        "total_manufacturing_cost",
        "month",
        "year",
        "createdAt",
      ],
      order: [
        ["year", "ASC"],
        ["month", "ASC"],
      ], // Latest records first
    });

    if (!salaries.length) {
      return res
        .status(404)
        .json({
          message:
            "No salary records found for this employee in the given range",
        });
    }
    

    res.json({
      monthlyData: salaries,
      employeeId
    });
  } catch (error) {
    console.error("Error fetching employee salary records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getEmployeeAnalysisOverall = async (req, res) => {
  try {
    let { employeeId, startYear, startMonth, endYear, endMonth } = req.params;

    // Convert params to numbers
    startYear = parseInt(startYear, 10);
    startMonth = parseInt(startMonth, 10);
    endYear = parseInt(endYear, 10);
    endMonth = parseInt(endMonth, 10);

    if (!startYear || !startMonth || !endYear || !endMonth) {
      return res
        .status(400)
        .json({ error: "Start and end year/month must be valid numbers" });
    }

    const cumulativeData = await EmployeeSalaries.findOne({
      where: {
        employeeId,
        [Op.and]: [
          Sequelize.literal(
            `(year * 12 + month) >= (${startYear} * 12 + ${startMonth})`
          ),
          Sequelize.literal(
            `(year * 12 + month) <= (${endYear} * 12 + ${endMonth})`
          ),
        ],
      },
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("salary")), "salary"],
        [Sequelize.fn("SUM", Sequelize.col("expenses")), "expenses"],
        [Sequelize.fn("SUM", Sequelize.col("target")), "target"],
        [Sequelize.fn("SUM", Sequelize.col("sale")), "total_sale"],
        [Sequelize.fn("SUM", Sequelize.col("CRM")), "CRM"],
        [
          Sequelize.fn("SUM", Sequelize.col("other_expenses")),
          "other_expenses",
        ],
        [
          Sequelize.fn("SUM", Sequelize.col("total_manufacturing_cost")),
          "total_manufacturing_cost",
        ],
      ],
      raw: true,
    });

    if (!cumulativeData) {
      return res
        .status(404)
        .json({
          message:
            "No salary records found for this employee in the given range",
        });
    }

    res.json({
      employeeId,
      startYear,
      startMonth,
      endYear,
      endMonth,
      ...cumulativeData,
    });
  } catch (error) {
    console.error("Error fetching cumulative employee salary records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  getAllEmployee,
  createEmployee,
  getEmployeeAnalysisMonthWise,
  createEmployeeSalary,
  getEmployeeAnalysisOverall,
};
