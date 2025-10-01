import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { PackageServices } from "./package.service";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";



const getAllPackages = catchAsync(async (req, res) => {
    const result = await PackageServices.getAllPackagesFromDB(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Packages retrieved successfully',
        data: result,
    });
});

const getPackageById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await PackageServices.getPackageByIdFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Package details retrieved successfully',
        data: result,
    });
});

const updateAndCreatePackageInDB = catchAsync(async (req, res) => {
    const updateData = req.body;
    console.log('updateData');
    const result = await PackageServices.updateAndCreatePackageInDB(updateData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Package updated successfully',
        data: result,
    });
});

const deletePackage = catchAsync(async (req, res) => {
    const { id } = req.params;
    await PackageServices.deletePackageFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.NO_CONTENT,
        message: 'Package deleted successfully',
        data: null,
    });
});

export const PackageControllers = {
    getAllPackages,
    getPackageById,
    updateAndCreatePackageInDB,
    deletePackage,
};
