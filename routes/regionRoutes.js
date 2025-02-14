import express from 'express';
const router = express.Router();
import regionController from '../controllers/regionController.js';


router.get('/analysis/monthwise/:regionId/:startYear/:startMonth/:endYear/:endMonth', regionController.getRegionAnalysisMonthWise);
router.get('/analysis/overall/:regionId/:startYear/:startMonth/:endYear/:endMonth', regionController.getRegionAnalysisOverall)
router.get('/:managerId', regionController.getAllRegion);
router.post('/', regionController.createRegion);

export default router;