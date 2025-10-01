import express from 'express';
import { PaymentControllers } from './payment.controller';
import auth from "../../middlewares/auth";
import {UserRoleEnum} from "@prisma/client";

const router = express.Router();

// Get all payments made by a specific user
router.get('/',auth(UserRoleEnum.SUPERADMIN,UserRoleEnum.ADMIN), PaymentControllers.getAllPayments);
router.get('/user',auth(UserRoleEnum.USER), PaymentControllers.getPaymentsByUser);

export default router;
