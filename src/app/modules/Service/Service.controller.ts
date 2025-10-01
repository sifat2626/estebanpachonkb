import catchAsync from "../../utils/catchAsync";

import { Request, Response } from "express";
import { estabanService } from "./Service.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import pickValidFields from "../../utils/pickValidFields";

const createService = catchAsync(async (req: Request, res: Response) => {

    const data = JSON.parse(req.body.data);
    const image  = req.file as  Express.Multer.File  || {};

    if (!image) {
        throw new AppError(httpStatus.BAD_REQUEST, 'banner is required');
    }

    const result = await estabanService.createService(data, image);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'service created successfully',
        data: result,
    });
});


const getServices = catchAsync(async (req: Request, res: Response) => {

    const filters = pickValidFields(req.query, ["searchTerm"]);

    const options = pickValidFields(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])

    const result = await estabanService.getServices(options, filters as { searchTerm: string });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'services retrieved successfully',
        data: result,
    });
});


const getService = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await estabanService.getService(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'service details retrieved successfully',
        data: result,
    });
});

const updateService = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    
    

    const data = JSON.parse(req.body.data || '{}');

    const file = req.file as Express.Multer.File;

    const result = await estabanService.updateService(id, data, file);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'service updated successfully',
        data: result,
    });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await estabanService.deleteService(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'service deleted successfully',
        data: null,
    });
}
);

const takeService = catchAsync(async (req: Request, res: Response) => {
    const {serviceId,packageId,gateway,paymentMethod,consumeReferral} = req.body
    const userId = req.user.id
    const result = await estabanService.takeService(serviceId, userId,packageId,gateway,paymentMethod,consumeReferral);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'service taken successfully',
        data: result,
    })
})

const consolidationService = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id
    const {serviceId,paymentMethodId,consumeReferral,days } =  req.body

    const result = await estabanService.consolidationService(serviceId,userId,paymentMethodId,consumeReferral,days)
    sendResponse(res, {
        statusCode:201,
        message:'consolidation service taken successfully',
        data: result,
    })
})

export const estabanServiceController = {
    createService,
    getServices,
    getService,
    updateService, 
    deleteService,
    takeService,
    consolidationService
};