import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { PartnerService } from "./partner.service";
import AppError from "../../errors/AppError";
import { uploadImageToSpaces } from "../../utils/uploadImage";

/**
 * Create a new partner
 */
const createPartner = catchAsync(async (req: Request, res: Response) => {
    const { name, website } = JSON.parse(req.body.data);
    const createdBy = req.user.id;

    // Check if an image is uploaded
    const logo = req.file as Express.Multer.File;
    if (!logo) {
        throw new AppError(httpStatus.BAD_REQUEST, "Logo image is required");
    }

    // Upload logo to cloud storage (e.g., DigitalOcean Spaces)
    const logoURL = await uploadImageToSpaces(logo);

    const result = await PartnerService.createPartner({ createdBy, name, website, logo: logoURL });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Partner created successfully",
        data: result,
    });
});

/**
 * Get all partners
 */
const getPartners = catchAsync(async (req: Request, res: Response) => {
    const partners = await PartnerService.getPartners();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Partners retrieved successfully",
        data: partners,
    });
});

/**
 * Get a single partner by ID
 */
const getPartnerById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const partner = await PartnerService.getPartnerById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Partner retrieved successfully",
        data: partner,
    });
});

/**
 * Update a partner
 */
const updatePartner = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = JSON.parse(req.body.data);

    // Check if a new logo is uploaded
    if (req.file) {
        data.logo = await uploadImageToSpaces(req.file as Express.Multer.File);
    }

    const updatedPartner = await PartnerService.updatePartner(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Partner updated successfully",
        data: updatedPartner,
    });
});

/**
 * Delete a partner
 */
const deletePartner = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const message = await PartnerService.deletePartner(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: message.message,
        data: {},
    });
});

export const PartnerController = {
    createPartner,
    getPartners,
    getPartnerById,
    updatePartner,
    deletePartner,
};
