import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import {EarnServices} from "./earn.service";

const updateEarn = catchAsync(async (req, res) => {

    const {value} = req.body;
    const result = await EarnServices.updateEarn(value)

    sendResponse(res, {
        statusCode:httpStatus.OK,
        message:'earn updated successfully',
        data: result,
    })
})

const getEarn = catchAsync(async (req, res) => {
    const earn = await EarnServices.getEarn()
    sendResponse(res, {
        statusCode:httpStatus.OK,
        message:'earn retrieved successfully',
        data: earn,
    })
})

export const EarnControllers = {
    updateEarn,
    getEarn
}