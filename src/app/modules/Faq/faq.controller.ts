import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { FAQService } from "./faq.service";
import AppError from "../../errors/AppError";

/**
 * Create a new FAQ
 */
const createFAQ = catchAsync(async (req: Request, res: Response) => {
    const { question,question_es, answer,answer_es } = req.body;
    const createdBy = req.user.id;

    if (!question || !answer) {
        throw new AppError(httpStatus.BAD_REQUEST, "Question and answer are required");
    }

    const result = await FAQService.createFAQ({ createdBy, question,question_es, answer,answer_es });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "FAQ created successfully",
        data: result,
    });
});

/**
 * Get all FAQs
 */
const getFAQs = catchAsync(async (req: Request, res: Response) => {
    const faqs = await FAQService.getFAQs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "FAQs retrieved successfully",
        data: faqs,
    });
});

/**
 * Get a single FAQ by ID
 */
const getFAQById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const faq = await FAQService.getFAQById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "FAQ retrieved successfully",
        data: faq,
    });
});

/**
 * Update an FAQ
 */
const updateFAQ = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updatedFAQ = await FAQService.updateFAQ(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "FAQ updated successfully",
        data: updatedFAQ,
    });
});

/**
 * Delete an FAQ
 */
const deleteFAQ = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const message = await FAQService.deleteFAQ(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: message.message,
        data: {}
    });
});

export const FAQController = {
    createFAQ,
    getFAQs,
    getFAQById,
    updateFAQ,
    deleteFAQ,
};
