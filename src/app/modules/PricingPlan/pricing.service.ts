import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { stripe } from '../../utils/stripe';
import { Level, Country, PaymentType } from '@prisma/client';
import { Stripe } from 'stripe';

// Create a new Pricing Plan
const createPricingPlan = async (data: {
  name: Level;
  name_es: string;
  baseRate: number;
  baseRate_es: string;
  country: Country;
  country_es: string;
  description: string;
  description_es: string;
  storageDays: number;
  storageDays_es: string;
  consolidationFee: number;
  consolidationFee_es: string;
  additionalFeatures: string[];
  additionalFeatures_es: string[];
  insurancePlan: string;
  insurancePlan_es: string;
}) => {
  const {
    name,
      name_es,
    baseRate,
    baseRate_es,
    description,
    description_es,
    country,
    country_es,
    storageDays,
    storageDays_es,
    consolidationFee,
    consolidationFee_es,
    additionalFeatures,
    additionalFeatures_es,
    insurancePlan,
    insurancePlan_es
  } = data;

  // Create the pricing plan
  const pricingPlan = await prisma.pricingPlan.create({
    data: {
      name,
      name_es,
      baseRate,
      baseRate_es,
      description,
      description_es,
      country,
      country_es,
      storageDays,
      storageDays_es,
      consolidationFee,
      consolidationFee_es,
      additionalFeatures,
      additionalFeatures_es,
      insurancePlan,
      insurancePlan_es
    },
  });

  return pricingPlan;
};

// Fetch all Pricing Plans
const getAllPricingPlans = async (query: any) => {
  try {
    console.log('Received query:', query); // Debugging

    const {
      name, // Filter by plan name
      minBaseRate, // Filter by minimum base rate
      maxBaseRate, // Filter by maximum base rate
      country, // Filter by country (Ensure this exists in the schema)
      page = 1, // Default page number
      limit = 10, // Default limit per page
      sortBy = 'createdAt', // Default sorting field
      sortOrder = 'desc', // Default sorting order
    } = query;

    // Ensure valid pagination values
    const take = Math.max(1, Number(limit)); // Ensure minimum limit is 1
    const skip = Math.max(0, (Number(page) - 1) * take); // Prevent negative skip values

    // Construct filter conditions
    const whereConditions: any = {};

    if (country) whereConditions.country = country; // Ensure this field exists in schema

    if (name) {
      whereConditions.name = { contains: name, mode: 'insensitive' }; // Case-insensitive search
    }

    if (minBaseRate !== undefined || maxBaseRate !== undefined) {
      whereConditions.baseRate = {
        ...(minBaseRate !== undefined && !isNaN(parseFloat(minBaseRate))
          ? { gte: parseFloat(minBaseRate) }
          : {}),
        ...(maxBaseRate !== undefined && !isNaN(parseFloat(maxBaseRate))
          ? { lte: parseFloat(maxBaseRate) }
          : {}),
      };
    }

    console.log('Constructed where conditions:', whereConditions); // Debugging

    // Count total matching pricing plans for pagination metadata
    const totalPricingPlans = await prisma.pricingPlan.count({
      where: whereConditions,
    });

    console.log('Total pricing plans found:', totalPricingPlans); // Debugging

    // Fetch paginated pricing plans with sorting
    const pricingPlans = await prisma.pricingPlan.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc',
      },
    });

    console.log('Fetched pricing plans:', pricingPlans.length); // Debugging

    // Return paginated data with metadata
    return {
      meta: {
        total: totalPricingPlans,
        limit: take,
        page: Number(page),
        totalPages: Math.ceil(totalPricingPlans / take),
      },
      data: pricingPlans,
    };
  } catch (error) {
    console.error('Error fetching pricing plans:', error);

    throw new AppError(500, 'Error retrieving pricing plans');
  }
};

// Get a specific Pricing Plan by ID
const getPricingPlanById = async (id: string) => {
  const pricingPlan = await prisma.pricingPlan.findUnique({
    where: { id },
  });

  if (!pricingPlan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pricing plan not found');
  }

  return pricingPlan;
};

// Update a Pricing Plan by ID
const updatePricingPlan = async (id: string, updateData: any) => {
  const updatedPricingPlan = await prisma.pricingPlan.update({
    where: { id },
    data: updateData,
  });

  return updatedPricingPlan;
};

// Delete a Pricing Plan by ID
const deletePricingPlan = async (id: string) => {
  const pricingPlan = await prisma.pricingPlan.findUnique({
    where: { id },
  });

  if (!pricingPlan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pricing plan not found');
  }

  await prisma.pricingPlan.delete({
    where: { id },
  });

  return { message: 'Pricing plan deleted successfully' };
};

// Calculate shipping fee based on weight and pricing plan
const calculateShippingFee = async (weight: number, pricingPlanId: string) => {
  // Fetch the pricing plan and related weight fees
  const pricingPlan = await prisma.pricingPlan.findUnique({
    where: { id: pricingPlanId },
  });

  if (!pricingPlan) {
    throw new AppError(httpStatus.NOT_FOUND, 'Pricing plan not found');
  }
  const fee = weight * pricingPlan.baseRate;

  return fee;
};

export const PricingServices = {
  createPricingPlan,
  getAllPricingPlans,
  getPricingPlanById,
  updatePricingPlan,
  deletePricingPlan,
  calculateShippingFee,
};
