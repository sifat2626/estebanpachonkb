import {OrderType, Package, PackageStatus} from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';
import httpStatus from 'http-status';
import { checkPayment } from '../../utils/checkPayment';


const getAllPackagesFromDB = async (query: any) => {
  try {
    const {
      limit = 10, // Default limit per page
      page = 1, // Default page number
      status, // Optional filter by package status
      minPrice, // Optional filter by minimum price
      maxPrice, // Optional filter by maximum price
      userId, // Optional filter by User ID
      sortBy = 'createdAt', // Default sorting field
      sortOrder = 'desc', // Default sorting order
      orderType
    } = query;

    // Ensure valid pagination values
    const take = Math.max(1, Number(limit)); // Ensure minimum limit is 1
    const skip = Math.max(0, (Number(page) - 1) * take); // Prevent negative skip values

    // Construct filter conditions
    const whereConditions: any = {};

    if(orderType) whereConditions.orderType = orderType;
    if (status) whereConditions.status = status;
    if (userId) whereConditions.userId = userId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // Count total packages matching the filters
    const totalPackages = await prisma.package.count({
      where: whereConditions,
    });

    // Fetch paginated packages with sorting
    const packages = await prisma.package.findMany({
      where: whereConditions,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc',
      },
      include: {
        user: true,
        consolidate: true,
        ServicePackage:{
          include:{
            service:true
          }
        }
      },
    });

    // Return paginated data with metadata
    return {
      meta: {
        total: totalPackages,
        limit: take,
        page: Number(page),
        totalPages: Math.ceil(totalPackages / take),
      },
      data: packages,
    };
  } catch (error) {
    // console.error("Error fetching packages:", error);
    throw new AppError(500, 'Error retrieving packages');
  }
};

const getPackageByIdFromDB = async (id: string) => {
  try {
    const userPackage = await prisma.package.findUnique({
      where: { id },
    });
    if (!userPackage) {
      throw new AppError(404, 'Package not found');
    }
    return userPackage;
  } catch (error) {
    throw new AppError(500, 'Error retrieving package');
  }
};

const updateAndCreatePackageInDB = async (updateData: Partial<Package>) => {
  return prisma.$transaction(async (tsx) => { // "tsx" instead of "prisma" for clarity
    const {id,weight, dimensions, note} = updateData;

    console.log(updateData);

    if (!weight) {
      throw new AppError(404, 'Weight not found');
    }

    if (!dimensions) {
      throw new AppError(404, 'Dimension not found');
    }

    let otherDatas: Partial<Package> = {}

    if (note) {
      otherDatas.note = note;
    }

    const pack = await tsx.package.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            pricingPlan: true,
          }
        },
      }
    })

    if (!pack) {
      throw new AppError(404, 'Pack not found');
    }

    const user = pack.user

    let expiryDate;

    const consolidationWindow = await prisma.consolidate.findFirst({
      where:{
        userId:user.id,
        endDate: {
          gt: new Date(),
        },
        startDate:{
          lt: new Date(),
        }
      }
    })

    // console.log(consolidationWindow);

    if(consolidationWindow) {
      otherDatas.consolidateId = consolidationWindow.id;
      otherDatas.expiryDate = consolidationWindow.endDate
    }

    if(!user.pricingPlan){
      throw new AppError(404, 'Plan not found');
    }

    if(pack.orderType === 'SINGLE'){
      otherDatas.consolidateId = null
      otherDatas.expiryDate = new Date(Date.now() + user.pricingPlan.storageDays * 24*60*60*1000);
    }

    if(pack.orderType === 'CONSOLIDATE' && !consolidationWindow) {
      otherDatas.orderType = 'SINGLE'
      otherDatas.expiryDate = new Date(Date.now() + user.pricingPlan.storageDays * 24*60*60*1000);
    }

    console.log({weight, dimensions, ...otherDatas});

    // Perform the package update inside the transaction
    return tsx.package.update({
      where: {id},
      data: {weight, dimensions, status:'STORED', ...otherDatas},
    });
  });
};

const deletePackageFromDB = async (id: string) => {
  const transaction = await prisma.$transaction(async prisma => {
    try {
      await prisma.package.delete({
        where: { id },
      });
    } catch (error) {
      throw new AppError(500, 'Error deleting package');
    }
  });

  return transaction;
};

export const PackageServices = {
  getAllPackagesFromDB,
  getPackageByIdFromDB,
  updateAndCreatePackageInDB,
  deletePackageFromDB,
};
