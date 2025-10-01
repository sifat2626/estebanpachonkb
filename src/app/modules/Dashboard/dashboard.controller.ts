import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import {DashboardServices} from "./dashboard.service";

const adminSummary = catchAsync(async (req, res) => {
    const result = await DashboardServices.adminSummary()

    sendResponse(res, {
        statusCode:httpStatus.OK,
        message:'summary retrieved successfully',
        data: result,
    })
})

const paymentsSummary = catchAsync(async (req, res) => {
    const {startDate, endDate} = req.body;
    const result = await DashboardServices.paymentsSummary(startDate, endDate);

    sendResponse(res, {
        statusCode:httpStatus.OK,
        message:'orders retrieved successfully',
        data: result,
    })
})

const agentSummary = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const result = await DashboardServices.agentSummary(userId);

    sendResponse(res, {
        statusCode:httpStatus.OK,
        message:'orders retrieved successfully',
        data: result,
    })
})



export const DashboardControllers = {
    adminSummary,
    paymentsSummary,
    agentSummary
}