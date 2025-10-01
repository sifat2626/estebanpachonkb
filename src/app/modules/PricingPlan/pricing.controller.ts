import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { PricingServices } from './pricing.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';

// Create a new Pricing Plan
const createPricingPlan = catchAsync(async (req: Request, res: Response) => {
    const { name,
        name_es,
        baseRate,
        baseRate_es,
        country,
        country_es,
        description,
        description_es,
        storageDays,
        storageDays_es,
        consolidationFee,
        consolidationFee_es,
        additionalFeatures,
        additionalFeatures_es,
        insurancePlan,
        insurancePlan_es } = req.body;

    const newPricingPlan = await PricingServices.createPricingPlan({
        name,
        name_es,
        baseRate,
        baseRate_es,
        country,
        country_es,
        description,
        description_es,
        storageDays,
        storageDays_es,
        consolidationFee,
        consolidationFee_es,
        additionalFeatures,
        additionalFeatures_es,
        insurancePlan,
        insurancePlan_es
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Pricing plan created successfully',
        data: newPricingPlan,
    });
});

// Fetch all Pricing Plans
const getAllPricingPlans = catchAsync(async (req: Request, res: Response) => {
    const pricingPlans = await PricingServices.getAllPricingPlans(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Pricing plans retrieved successfully',
        data: pricingPlans,
    });
});

// Get a specific Pricing Plan by ID
const getPricingPlanById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const pricingPlan = await PricingServices.getPricingPlanById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Pricing plan retrieved successfully',
        data: pricingPlan,
    });
});

// Update a Pricing Plan by ID
const updatePricingPlan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPricingPlan = await PricingServices.updatePricingPlan(id, updateData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Pricing plan updated successfully',
        data: updatedPricingPlan,
    });
});

// Delete a Pricing Plan by ID
const deletePricingPlan = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await PricingServices.deletePricingPlan(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Pricing plan deleted successfully',
        data: null,
    });
});

// Calculate shipping fee based on weight and pricing plan
const calculateShippingFee = catchAsync(async (req: Request, res: Response) => {
    const { weight, pricingPlanId } = req.body;

    const fee = await PricingServices.calculateShippingFee(weight, pricingPlanId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Shipping fee calculated successfully',
        data: fee,
    });
});



export const PricingControllers = {
    createPricingPlan,
    getAllPricingPlans,
    getPricingPlanById,
    updatePricingPlan,
    deletePricingPlan,
    calculateShippingFee,
};
