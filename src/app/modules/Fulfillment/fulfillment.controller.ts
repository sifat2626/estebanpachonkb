import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { FulfillmentService } from "./fulfillment.service";
import AppError from "../../errors/AppError";

/**
 * Create a new fulfillment entry
 */
const createFulfillment = catchAsync(async (req: Request, res: Response) => {
    const { fulfillmentText, fulfillmentText_es } = req.body;

    if (!fulfillmentText || !fulfillmentText_es) {
        throw new AppError(httpStatus.BAD_REQUEST, "Both fulfillmentText and fulfillmentText_es are required");
    }

    const result = await FulfillmentService.createFulfillment({ fulfillmentText, fulfillmentText_es });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Fulfillment entry created successfully",
        data: result,
    });
});

/**
 * Get all fulfillment entries
 */
const getFulfillments = catchAsync(async (req: Request, res: Response) => {
    const fulfillments = await FulfillmentService.getFulfillments();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Fulfillments retrieved successfully",
        data: fulfillments,
    });
});

/**
 * Get a single fulfillment by ID
 */
const getFulfillmentById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const fulfillment = await FulfillmentService.getFulfillmentById(id);

    if (!fulfillment) {
        throw new AppError(httpStatus.NOT_FOUND, "Fulfillment not found");
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Fulfillment retrieved successfully",
        data: fulfillment,
    });
});

/**
 * Update a fulfillment entry
 */
const updateFulfillment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updatedFulfillment = await FulfillmentService.updateFulfillment(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Fulfillment updated successfully",
        data: updatedFulfillment,
    });
});

/**
 * Delete a fulfillment entry
 */
const deleteFulfillment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await FulfillmentService.deleteFulfillment(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Fulfillment deleted successfully",
        data: {},
    });
});

export const FulfillmentController = {
    createFulfillment,
    getFulfillments,
    getFulfillmentById,
    updateFulfillment,
    deleteFulfillment,
};
