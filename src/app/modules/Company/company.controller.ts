import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { CompanyService } from "./company.service";
import AppError from "../../errors/AppError";

/**
 * Create a new company
 */
const createCompany = catchAsync(async (req: Request, res: Response) => {
    const { name, logo, website, createdBy } = req.body;

    if (!name || !logo || !createdBy) {
        throw new AppError(httpStatus.BAD_REQUEST, "Name, logo, and createdBy are required");
    }

    const result = await CompanyService.createCompany({ name, logo, website, createdBy });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: "Company created successfully",
        data: result,
    });
});

/**
 * Get all companies
 */
const getCompanies = catchAsync(async (req: Request, res: Response) => {
    const companies = await CompanyService.getCompanies();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Companies retrieved successfully",
        data: companies,
    });
});

/**
 * Get a single company by ID
 */
const getCompanyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const company = await CompanyService.getCompanyById(id);

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found");
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Company retrieved successfully",
        data: company,
    });
});

/**
 * Update a company
 */
const updateCompany = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    const updatedCompany = await CompanyService.updateCompany(id, data);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Company updated successfully",
        data: updatedCompany,
    });
});

/**
 * Delete a company
 */
const deleteCompany = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await CompanyService.deleteCompany(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Company deleted successfully",
        data: {},
    });
});

export const CompanyController = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
};
