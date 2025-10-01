import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { AboutUsService } from "./about.service";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";

/**
 * Create a new About Us entry
 */
const createAboutUs = catchAsync(async (req: Request, res: Response) => {
    const { aboutText, aboutText_es } = req.body;

    if (!aboutText || !aboutText_es) {
        throw new AppError(httpStatus.BAD_REQUEST, "Both aboutText and aboutText_es are required");
    }

    const result = await AboutUsService.createAboutUs({ aboutText, aboutText_es });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "About Us entry created successfully",
        data: result,
    });
});

/**
 * Get About Us entry
 */
const getAboutUs = catchAsync(async (req: Request, res: Response) => {
    const aboutUs = await AboutUsService.getAboutUs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "About Us retrieved successfully",
        data: aboutUs,
    });
});

/**
 * Update About Us entry
 */
const updateAboutUs = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;

    const updatedAboutUs = await AboutUsService.updateAboutUs(data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "About Us updated successfully",
        data: updatedAboutUs,
    });
});



export const AboutUsController = {
    createAboutUs,
    getAboutUs,
    updateAboutUs,
};
