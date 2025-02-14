import express from 'express';
const router = express.Router();
import employeeController from '../controllers/employeeController.js';
import { upload } from '../config/multer.js';


router.get('/analysis/monthwise/:employeeId/:startYear/:startMonth/:endYear/:endMonth', employeeController.getEmployeeAnalysisMonthWise)
router.get('/analysis/overall/:employeeId/:startYear/:startMonth/:endYear/:endMonth', employeeController.getEmployeeAnalysisOverall)
router.get('/:regionId', employeeController.getAllEmployee);
router.post('/', upload.single("ggcimage"), employeeController.createEmployee);
router.post('/salary', employeeController.createEmployeeSalary);

export default router;