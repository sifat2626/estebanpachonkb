import express from 'express';
import auth from "../../middlewares/auth";
import { consolidationController } from './Consolidation.controller';
import { UserRoleEnum } from '@prisma/client';
import { checkPayment } from "../../utils/checkPayment";  // Payment check middleware

const router = express.Router();

// Route to create a consolidation (only for USER role)
router.post('/', auth(UserRoleEnum.USER), checkPayment, consolidationController.createConsolidation);

// Route to get all consolidations (only for ADMIN and SUPERADMIN roles)
router.get('/', auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN), consolidationController.getAllConsolidations);

// Route to get user-specific consolidations (only for logged-in users)
router.get('/user', auth(UserRoleEnum.USER), consolidationController.getConsolidationsByUser);

// Route to update a consolidation (only for ADMIN and SUPERADMIN roles)
router.put('/:consolidationId', auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN), consolidationController.updateConsolidation);

// Route to delete a consolidation (only for ADMIN and SUPERADMIN roles)
router.delete('/:consolidationId', auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN), consolidationController.deleteConsolidation);

export const consolidationRoute = router;
