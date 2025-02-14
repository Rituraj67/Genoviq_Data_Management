// routes/companyRoutes.js
import express from 'express';
const router = express.Router();
import managerController from '../controllers/managerController.js';
import { upload } from '../config/multer.js';

router.get('/analysis/monthwise/:managerId/:startYear/:startMonth/:endYear/:endMonth', managerController.getManagerAnalysisMonthWise );
router.get('/analysis/overall/:managerId/:startYear/:startMonth/:endYear/:endMonth', managerController.getManagerAnalysisOverall);
router.get('/:companyId', managerController.getAllManager);
router.post('/', upload.single("ggcimage"), managerController.createManager);
router.post('/salary', managerController.createManagerSalary);

export default router;