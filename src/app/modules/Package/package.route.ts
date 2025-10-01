import { Router } from 'express';
import { PackageControllers } from './package.controller';
import auth from "../../middlewares/auth";

const router = Router();

// Routes for package operations
router.get('/',auth('ADMIN','SUPERADMIN'), PackageControllers.getAllPackages);
router.get('/:id',auth('ADMIN','SUPERADMIN'), PackageControllers.getPackageById);
router.post('/',auth('ADMIN','SUPERADMIN'), PackageControllers.updateAndCreatePackageInDB);
router.delete('/:id',auth('ADMIN','SUPERADMIN'), PackageControllers.deletePackage);

export default router;
