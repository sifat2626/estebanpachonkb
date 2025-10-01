import express from "express";
import { PartnerController } from "./partner.controller";
import auth from "../../middlewares/auth";
import { uploadSingle } from "../../utils/multer";

const router = express.Router();

router.post("/", auth("ADMIN", "SUPERADMIN"), uploadSingle, PartnerController.createPartner); // Create a partner
router.get("/", PartnerController.getPartners); // Get all partners
router.get("/:id", PartnerController.getPartnerById); // Get a partner by ID
router.patch("/:id", auth("ADMIN", "SUPERADMIN"), uploadSingle, PartnerController.updatePartner); // Update a partner
router.delete("/:id", auth("ADMIN", "SUPERADMIN"), PartnerController.deletePartner); // Delete a partner

export const PartnerRoutes = router;
