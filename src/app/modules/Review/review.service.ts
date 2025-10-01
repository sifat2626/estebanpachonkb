import prisma from "../../utils/prisma";
import { Review } from "@prisma/client";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

/**
 * Create a new review
 */
const createReview = async (data: { createdBy: string; imageURL: string; name: string;name_es:string; rating: number,review:string;review_es:string }) => {
    const { createdBy, imageURL, name, name_es, rating,review,review_es } = data;

    // Create the review entry in the database
    return prisma.review.create({
        data: {
            createdBy,
            image: imageURL,  // Assuming imageURL is the image URL string after upload
            name,
            name_es,
            rating: Number(rating),
            review,
            review_es
        }
    });
};


/**
 * Get all reviews
 */
const getReviews = async () => {
    return await prisma.review.findMany({
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Get a single review by ID
 */
const getReviewById = async (id: string) => {
    const review = await prisma.review.findUnique({
        where: { id },
    });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    return review;
};

/**
 * Update a review
 */
const updateReview = async (id: string, data: Partial<Review>) => {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    return prisma.review.update({
        where: { id },
        data,
    });
};

/**
 * Delete a review
 */
const deleteReview = async (id: string) => {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    }

    await prisma.review.delete({
        where: { id },
    });

    return { message: "Review deleted successfully" };
};

export const ReviewService = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
};
