import express from 'express';
import { PricingControllers } from './pricing.controller';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

// Create a new Pricing Plan
router.post('/', PricingControllers.createPricingPlan);

// Get all Pricing Plans
router.get('/', PricingControllers.getAllPricingPlans);
``;

// Get Pricing Plan by ID
router.get('/:id', PricingControllers.getPricingPlanById);

// Update Pricing Plan by ID
router.put('/:id', PricingControllers.updatePricingPlan);

// Delete Pricing Plan by ID
router.delete('/:id', PricingControllers.deletePricingPlan);

// Calculate shipping fee based on weight and pricing plan
router.post('/calculate-fee', PricingControllers.calculateShippingFee);



export default router;
