import { PaymentType, Prisma, Service } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { uploadImageToSpaces } from '../../utils/uploadImage';
import { IPaginationOptions } from '../../interface/pagination.type';
import { calculatePagination } from '../../utils/calculatePagination';
import { HandlePayment } from '../../utils/handlePayment';

const createService = async (service: Service, banner: Express.Multer.File) => {
  const isExist = await prisma.service.findFirst({
    where: {
      name: service.name,
    },
  });

  if (service.price) {
    service.price = Number(service.price);
  }

  const imgUrl = await uploadImageToSpaces(banner);
  service.banner = imgUrl;

  if (isExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Service already exists with this name',
    );
  }

  return prisma.service.create({
    data: service,
  });
};

const getServices = async (
  options: IPaginationOptions,
  params: { searchTerm?: string },
) => {
  const { page, limit, skip } = calculatePagination(options);
  const { searchTerm } = params;

  // Construct filter conditions
  const andConditions: Prisma.ServiceWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      name: {
        contains: searchTerm,
        mode: 'insensitive', // Case-insensitive search
      },
    });
  }

  const whereConditions: Prisma.ServiceWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  // Count total services matching the filters
  const total = await prisma.service.count({ where: whereConditions });

  // Metadata for pagination
  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  // Fetch paginated services with sorting
  const result = await prisma.service.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  return {
    meta,
    data: result,
  };
};

const getService = async (id: string) => {
  const isExist = await prisma.service.findUnique({ where: { id } });
  if (!isExist) throw new AppError(httpStatus.NOT_FOUND, 'Service not found');

  return prisma.service.findUnique({
    where: {
      id,
    },
  });
};

const updateService = async (
  id: string,
  service: Partial<Service>,
  file?: Express.Multer.File,
) => {
  const isExist = await prisma.service.findUnique({ where: { id } });

  if (!isExist) throw new AppError(httpStatus.NOT_FOUND, 'Service not found');

  if (file) {
    const imgUrl = await uploadImageToSpaces(file);
    service.banner = imgUrl;
  }

  return prisma.service.update({
    where: {
      id,
    },
    data: service,
  });
};

const deleteService = async (id: string) => {
  const isExist = await prisma.service.findUnique({ where: { id } });
  if (!isExist) throw new AppError(httpStatus.NOT_FOUND, 'Service not found');

  await prisma.service.delete({
    where: {
      id,
    },
  });
};

const takeService = async (
  serviceId: string,
  userId: string,
  packageId: string,
  gateway: string,
  paymentMethod: string,
  consumeReferral: number,
) => {
  return prisma.$transaction(async tsx => {
    const service = await tsx.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
    }

    const user = await tsx.user.findUnique({
      where: { id: userId },
      include: {
        pricingPlan: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const pack = await tsx.package.findUnique({
      where: { id: packageId },
    });

    if (!pack) {
      throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    }

    if (pack.status !== 'ALERTED') {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Pack not found for this service',
      );
    }

    if(service.name === 'CONSOLIDATION'){
      throw new AppError(400, 'Take other services')
    }

      const servicePack = await tsx.servicePackage.findFirst({
        where: {
          serviceId,
          packageId,
        },
      });

      if (servicePack) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'You already have this service for this package',
        );
      }

    let addedPrice = 0;

    // For non-CONSOLIDATION services, handle payment normally
    const payment = await HandlePayment(
      gateway,
      service.price,
      userId,
      paymentMethod,
      'SERVICE',
      tsx,
      consumeReferral,
    );

    if (!payment) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    return tsx.servicePackage.create({
      data: {
        packageId,
        serviceId,
      },
      include: {
        package: true,
        service: true,
      },
    });
  });
};

const consolidationService = async (
  serviceId: string,
  userId: string,
  paymentMethodId: string,
  consumeReferral: number,
  days: number,
) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  if (service.name !== 'CONSOLIDATION') {
    throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const price = days * service.price;
  await prisma.$transaction(async tsx => {
    const payment = await HandlePayment(
      'STRIPE',
      price,
      userId,
      paymentMethodId,
      'CONSOLIDATION',
      tsx,
      consumeReferral,
    );
    const existingConsolidation = await tsx.consolidate.findFirst({
      where: {
        userId: userId,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
    });

    const packages = await tsx.package.findMany({
      where: {
        userId: userId,
        status: 'ALERTED',
        orderType: 'CONSOLIDATE',
      },
    });

    let consolidate;

    if (existingConsolidation) {
      consolidate = await tsx.consolidate.update({
        where: {
          id: existingConsolidation.id,
        },
        data: {
          endDate: new Date(
            existingConsolidation.endDate.getTime() +
              days * 24 * 60 * 60 * 1000,
          ),
        },
      });
    } else {
      consolidate = await tsx.consolidate.create({
        data: {
          startDate: new Date(),
          endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
          userId,
        },
      });
    }

    return tsx.package.updateMany({
      where: {
        userId,
        status: 'ALERTED',
        orderType: 'CONSOLIDATE',
      },
      data: {
        consolidateId: consolidate.id,
        expiryDate:consolidate.endDate
      },
    });
  });
};


export const estabanService = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
  takeService,
  consolidationService
};
