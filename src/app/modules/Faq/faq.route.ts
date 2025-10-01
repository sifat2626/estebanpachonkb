import express from "express";
import { FAQController } from "./faq.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth('ADMIN', 'SUPERADMIN'), FAQController.createFAQ); // Create an FAQ
router.get("/", FAQController.getFAQs); // Get all FAQs
router.get("/:id", FAQController.getFAQById); // Get an FAQ by ID
router.patch("/:id", auth('ADMIN', 'SUPERADMIN'), FAQController.updateFAQ); // Update an FAQ
router.delete("/:id", auth('ADMIN', 'SUPERADMIN'), FAQController.deleteFAQ); // Delete an FAQ

export const FAQRoutes = router;
