import auth from "../../middlewares/auth";
import {UserRoleEnum} from "@prisma/client";
import {DashboardControllers} from "../Dashboard/dashboard.controller";
import express from "express";
import {EarnControllers} from "./earn.controller";

const router = express.Router();

router.post('/',auth(UserRoleEnum.SUPERADMIN), EarnControllers.updateEarn);
router.get('/', EarnControllers.getEarn);

export const EarnRoutes = router;
