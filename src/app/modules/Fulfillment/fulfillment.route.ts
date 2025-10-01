import express from "express";
import {FulfillmentController} from "./fulfillment.controller";
import auth from "../../middlewares/auth";
import {UserRoleEnum} from "@prisma/client";

const router = express.Router();

router.post("/",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), FulfillmentController.createFulfillment);
router.get("/", FulfillmentController.getFulfillments);
router.get("/:id", FulfillmentController.getFulfillmentById);
router.patch("/:id",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), FulfillmentController.updateFulfillment);
router.delete("/:id",auth(UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN), FulfillmentController.deleteFulfillment);

export const FulfillmentRoutes = router;