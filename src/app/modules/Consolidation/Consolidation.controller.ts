import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { consolidationService } from "./Consolidation.service";

// Create Consolidation
const createConsolidation = catchAsync(async (req, res) => {
    const { packageId } = req.body;
    const userId = req.user.id;

    const result = await consolidationService.createConsolidation(userId, packageId);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Consolidation created successfully',
        data: result,
    });
});

// Get All Consolidations
const getAllConsolidations = catchAsync(async (req, res) => {
    const filters = req.query;
    // console.log('get all consolidations');

    const result = await consolidationService.getAllConsolidations(filters);

    sendResponse(res, {
        statusCode: 200,
        message: 'Consolidations retrieved successfully',
        data: result,
    });
});

const getConsolidationsByUser = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const result = await consolidationService.getConsolidationsByUser(userId)

    sendResponse(res, {
        statusCode:200,
        message:'Consolidations retrieved successfully',
        data: result,
    })
})



// Update Consolidation
const updateConsolidation = catchAsync(async (req, res) => {
    const { consolidationId, days, price,startDate,endDate } = req.body; // Assuming these are the fields you want to update
    const result = await consolidationService.updateConsolidation(consolidationId, days, price,startDate,endDate);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Consolidation updated successfully',
        data: result,
    });
});

// Delete Consolidation
const deleteConsolidation = catchAsync(async (req, res) => {
    const { consolidationId } = req.params;  // Assuming `consolidationId` is passed in the URL params
    await consolidationService.deleteConsolidation(consolidationId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Consolidation deleted successfully',
        data:null
    });
});



export const consolidationController = {
    createConsolidation,
    getAllConsolidations,
    getConsolidationsByUser,
    updateConsolidation,
    deleteConsolidation,
};
