// routes/companyRoutes.js
import express from 'express';
const router = express.Router();
import companyController from '../controllers/companyController.js';
import { upload } from '../config/multer.js';


router.get('/', companyController.getAllCompanies);
router.get('/analysis/monthwise/:companyId/:startYear/:startMonth/:endYear/:endMonth', companyController.getCompanyAnalysisMonthWise);
router.get('/analysis/overall/:companyId/:startYear/:startMonth/:endYear/:endMonth', companyController.getCompanyAnalysisOverall);
router.post('/', upload.single("ggcimage"), companyController.createCompany);


export default router; 