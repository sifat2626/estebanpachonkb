import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { ReviewService } from "./review.service";
import AppError from "../../errors/AppError";
import {uploadImageToSpaces} from "../../utils/uploadImage";

/**
 * Create a new review
 */
const createReview = catchAsync(async (req: Request, res: Response) => {
    // Parse incoming data
    const data = JSON.parse(req.body.data);
    const { name,name_es, rating,review,review_es } = data;
    const createdBy = req.user.id

    // Check if an image is uploaded
    const image = req.file as Express.Multer.File;

    if (!image) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
    }

    // Upload the image to the specified storage (like DigitalOcean Spaces)
    const imageURL = await uploadImageToSpaces(image);

    // Create the review in the database
    const result = await ReviewService.createReview({ createdBy, imageURL, name, name_es, rating,review,review_es });

    // Send the response back to the client
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Review created successfully",
        data: result,
    });
});


/**
 * Get all reviews
 */
const getReviews = catchAsync(async (req: Request, res: Response) => {
    const reviews = await ReviewService.getReviews();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Reviews retrieved successfully",
        data: reviews,
    });
});

/**
 * Get a single review by ID
 */
const getReviewById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const review = await ReviewService.getReviewById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Review retrieved successfully",
        data: review,
    });
});

/**
 * Update a review
 */
const updateReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updatedReview = await ReviewService.updateReview(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Review updated successfully",
        data: updatedReview,
    });
});

/**
 * Delete a review
 */
const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const message = await ReviewService.deleteReview(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: message.message,
        data:{}
    });
});

export const ReviewController = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
};
