import {AboutUsController} from "./about.controller";
import express from "express";
import auth from "../../middlewares/auth";
import {UserRoleEnum} from "@prisma/client";

const router = express.Router();

router.post("/",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), AboutUsController.createAboutUs);
router.get("/", AboutUsController.getAboutUs);
router.patch("/",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), AboutUsController.updateAboutUs);

export const AboutUsRoutes = router;