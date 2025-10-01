import express from 'express';
import auth from "../../middlewares/auth";
import {UserRoleEnum} from "@prisma/client";
import {DashboardControllers} from "./dashboard.controller";

const router = express.Router();

router.get('/admin', auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), DashboardControllers.adminSummary);
router.post('/admin/payments-summary',auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), DashboardControllers.paymentsSummary);
router.get('/agent',auth(UserRoleEnum.AGENT), DashboardControllers.agentSummary);


export const DashboardRoutes = router;
