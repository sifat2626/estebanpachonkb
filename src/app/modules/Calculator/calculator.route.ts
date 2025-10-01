import express from 'express';
import auth from "../../middlewares/auth";
import { UserRoleEnum } from '@prisma/client';
import {CalculatorController} from "./calculator.controller";  // Payment check middleware

const router = express.Router();

// Route to create a consolidation (only for USER role)
router.post('/', auth(UserRoleEnum.USER), CalculatorController.calculate);




export const CalculatorRoutes = router;
