import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import {uploadSingle} from "../../utils/multer";

const router = express.Router();

router.post("/",auth('ADMIN','SUPERADMIN'),uploadSingle, ReviewController.createReview); // Create a review
router.get("/", ReviewController.getReviews); // Get all reviews
router.get("/:id",auth('ADMIN','SUPERADMIN'), ReviewController.getReviewById); // Get a review by ID
router.patch("/:id",auth('ADMIN','SUPERADMIN'), ReviewController.updateReview); // Update a review
router.delete("/:id",auth('ADMIN','SUPERADMIN'), ReviewController.deleteReview); // Delete a review

export const ReviewRoutes = router;
