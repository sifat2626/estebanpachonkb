import express from "express";
import auth from "../../middlewares/auth";
import { WarehouseControllers } from "./warehouse.controller";

const router = express.Router();

router.post("/", auth("ADMIN", "SUPERADMIN"), WarehouseControllers.createWarehouse);
router.get("/", auth(), WarehouseControllers.getAllWarehouses);
router.get("/:id", auth(), WarehouseControllers.getWarehouseById);
router.put("/:id", auth("ADMIN", "SUPERADMIN"), WarehouseControllers.updateWarehouse);
router.delete("/:id", auth("ADMIN", "SUPERADMIN"), WarehouseControllers.deleteWarehouse);

export const WarehouseRoutes = router;
