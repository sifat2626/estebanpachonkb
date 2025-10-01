import prisma from '../../utils/prisma';
import { stripe } from '../../utils/stripe';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';



const createConsolidation = async (userId:string,packageId:string) => {
  return prisma.$transaction(async prisma => {
    // Fetch user details
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
    }

    const consolidationWindow = await prisma.consolidate.findFirst({
      where:{
        userId,
        endDate: {
          gt: new Date(),
        },
        startDate:{
          lt: new Date(),
        }
      }
    })

    if(!consolidationWindow) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Consolidation not found');
    }

    const pack = await prisma.package.findUnique({
      where:{
        id: userId,
      }
    })

    if(!pack) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
    }

    if(pack.status !== 'ALERTED' || pack.orderType !== 'CONSOLIDATE'){
      throw new AppError(httpStatus.BAD_REQUEST, 'package is not allowed for consolidation');
    }

    const result = await prisma.package.update({
      where:{
        id:packageId
      },data:{
        consolidateId: consolidationWindow.id,
      }
    })

    return result;

  });
};

const getAllConsolidations = async (filters:any) => {
  const {
    id,
    userId,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  // Ensure valid pagination values
  const take = Math.max(1, Number(limit)); // Ensure minimum limit is 1
  const skip = Math.max(0, (Number(page) - 1) * take); // Prevent negative skip values

  // Construct the filter conditions
  const whereConditions:any = {};


  if(id){
    whereConditions.id = id;
  }

  if(userId){
    whereConditions.userId = userId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereConditions.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  if (startDate || endDate) {
    whereConditions.startDate = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  // Count total matching consolidations for pagination metadata
  const totalConsolidations = await prisma.consolidate.count({ where: whereConditions });

  // Fetch paginated consolidations
  const consolidations = await prisma.consolidate.findMany({
    where: whereConditions,
    include: {
      packages: true, // Include related packages if needed
      user: true, // Include related user if needed
    },
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc', // Handle sorting by field
    },
  });

  return {
    meta: {
      total: totalConsolidations,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalConsolidations / take),
    },
    data: consolidations,
  };
};

const getUserConsolidations = async (userId:string,filters:any) => {
  const {
    id,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  // Ensure valid pagination values
  const take = Math.max(1, Number(limit)); // Ensure minimum limit is 1
  const skip = Math.max(0, (Number(page) - 1) * take); // Prevent negative skip values

  // Construct the filter conditions
  const whereConditions:any = {};

  if(id){
    whereConditions.id = id;
  }

  if(userId){
    whereConditions.userId = userId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereConditions.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  if (startDate || endDate) {
    whereConditions.startDate = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  // Count total matching consolidations for pagination metadata
  const totalConsolidations = await prisma.consolidate.count({ where: whereConditions });

  // Fetch paginated consolidations
  const consolidations = await prisma.consolidate.findMany({
    where: whereConditions,
    include: {
      packages: true, // Include related packages if needed
      user: true, // Include related user if needed
    },
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc', // Handle sorting by field
    },
  });

  return {
    meta: {
      total: totalConsolidations,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalConsolidations / take),
    },
    data: consolidations,
  };
};

// Update Consolidation
const updateConsolidation = async (
    consolidationId: string,
    days: number,
    price: number,
    startDate: Date,
    endDate: Date
) => {
  // Create the updateData object
  const updateData: any = {};

  // Add properties to updateData if they are provided
  if (days) updateData.days = days;
  if (price) updateData.price = price;
  if (startDate) updateData.startDate = startDate;
  if (endDate) updateData.endDate = endDate;

  // Update the consolidation record
  const consolidation = await prisma.consolidate.update({
    where: { id: consolidationId },
    data: {
      ...updateData,  // Apply the conditional fields
      updatedAt: new Date(),  // Always update the timestamp
    },
  });

  return consolidation;
};


// Delete Consolidation
const deleteConsolidation = async (consolidationId:string) => {
  await prisma.consolidate.delete({
    where: { id: consolidationId },
  });
};

const getConsolidationsByUser = async (userId:string) => {
  const consolidations = await prisma.consolidate.findMany({
    where: {
      userId: userId,
      status: 'ACCEPTED'
    },include:{
      packages: true,
    }
  })
  return consolidations;
}

export const consolidationService = {
  createConsolidation,
  getAllConsolidations,
  getUserConsolidations,
  updateConsolidation,
  deleteConsolidation,
  getConsolidationsByUser
};
