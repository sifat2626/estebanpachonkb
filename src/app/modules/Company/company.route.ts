import express from "express";
import { CompanyController } from "./company.controller";
import auth from "../../middlewares/auth";
import { uploadSingle } from "../../utils/multer";

const router = express.Router();

router.post("/", auth("ADMIN", "SUPERADMIN"), uploadSingle, CompanyController.createCompany); // Create a company
router.get("/", CompanyController.getCompanies); // Get all companies
router.get("/:id", CompanyController.getCompanyById); // Get a company by ID
router.patch("/:id", auth("ADMIN", "SUPERADMIN"), uploadSingle, CompanyController.updateCompany); // Update a company
router.delete("/:id", auth("ADMIN", "SUPERADMIN"), CompanyController.deleteCompany); // Delete a company

export const CompanyRoutes = router;