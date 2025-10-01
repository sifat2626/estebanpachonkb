import { OrderStatus, OrderType, Package, PackageStatus } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { HandlePayment } from '../../utils/handlePayment';
import { sendEmail } from '../../utils/sendEmail';

const reviewOrder = async (packages: Package[], userId: string) => {
  let totalWeight = 0;
  for (const pack of packages) {
    console.log(pack);
    if (!pack.weight) {
      throw new AppError(400, 'Invalid package weight');
    }
    totalWeight += pack.weight;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      pricingPlan: true,
    },
  });

  if (!user) {
    throw new AppError(400, 'Invalid user');
  }

  if (!user.pricingPlanId) {
    throw new AppError(400, 'Invalid prisma plan');
  }

  const pricingPlan = user.pricingPlan;

  if (!pricingPlan) {
    throw new AppError(400, 'Invalid pricing plan');
  }
  const price = totalWeight * pricingPlan.baseRate;

  return { price, totalWeight, packages };
};

const sendEmailContent = (user: any, planName: string) => `
  <html>
    <body>
      <h1>Congratulations on Your Plan Upgrade!</h1>
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Your pricing plan has been successfully upgraded to the <strong>${planName} Plan</strong>!</p>
      <p>This upgrade provides additional features and benefits to enhance your experience.</p>
      <p>If you have any questions, feel free to email us</a>.</p>
    </body>
  </html>
`;

const createOrder = async (
  userId: string,
  payload: {
    paymentMethod: string;
    warehouseId: string;
    orderType: OrderType;
    consumeReferral: number;
    packageIds: string[];
    consolidationId?: string;
    note?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      pricingPlan: true,
    },
  });

  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found');

  if (!user.pricingPlanId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No Pricing Plan Found');
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!profile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Profile not found');
  }

  let packages = [];

  for (const pack of payload.packageIds) {
    console.log(pack);
    const newPackage = await prisma.package.findUnique({
      where: {
        id: pack,
      },
    });

    if (!newPackage) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
    }

    if (newPackage.status !== 'STORED') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Package is not stored yet');
    }

    packages.push(newPackage);
  }

  const { price, totalWeight } = await reviewOrder(packages, userId);

  // Perform transactional operations
  const result = await prisma.$transaction(
    async tsx => {
      // Create the order

      if (payload.packageIds.length > 0) {
        orderType: OrderType.CONSOLIDATE;
      }
      const createdOrder = await tsx.order.create({
        data: {
          userId,
          totalWeight: totalWeight,
          totalPrice: price,
          destinationWarehouseId: payload.warehouseId,
          type: payload.orderType,
          note: payload.note,
        },
      });

      await tsx.orderHistory.create({
        data: {
          orderId: createdOrder.id,
        },
      });

      const payment = await HandlePayment(
        'STRIPE',
        price,
        userId,
        payload.paymentMethod,
        'ORDER',
        tsx,
        payload.consumeReferral,
      );

      if (!payment) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Payment not found');
      }

      for (const pack of packages) {
        if (pack.status !== PackageStatus.STORED) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
        }
        await tsx.package.update({
          where: {
            id: pack.id,
          },
          data: {
            status: PackageStatus.ORDERED,
            orderId: createdOrder.id,
          },
        });
      }

      if (payload.orderType === OrderType.CONSOLIDATE) {
        const pack = await prisma.package.findUnique({
          where: {
            id: payload.packageIds.at(0),
          },
        });

        if (!pack) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
        }

        if (!pack.consolidateId) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Package not found');
        }

        await tsx.consolidate.update({
          where: {
            id: pack.consolidateId,
          },
          data: {
            endDate: new Date(),
          },
        });
      }

      const updatedUser = await tsx.user.update({
        where: {
          id: userId,
        },
        data: {
          packageCount: {
            increment: 1,
          },
        },
      });

      if (payload.consolidationId) {
        await tsx.consolidate.update({
          where: {
            id: payload.consolidationId,
          },
          data: {
            status: 'ORDERED',
            endDate: new Date(),
          },
        });
      }

      if (updatedUser.packageCount === 20) {
        const pricingPlan = await tsx.pricingPlan.findFirst({
          where: {
            name: 'INTERMEDIATE',
            country: profile.country,
          },
        });

        if (!pricingPlan) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Pricing plan not found');
        }
        await tsx.user.update({
          where: {
            id: userId,
          },
          data: {
            pricingPlanId: pricingPlan.id,
          },
        });

        await sendEmail(
          user.email,
          'Plan Upgraded',
          sendEmailContent(user, 'INTERMEDIATE'),
        );
      } else if (updatedUser.packageCount === 50) {
        const pricingPlan = await tsx.pricingPlan.findFirst({
          where: {
            name: 'EXPERT',
            country: profile.country,
          },
        });

        if (!pricingPlan) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Pricing plan not found');
        }
        await tsx.user.update({
          where: {
            id: userId,
          },
          data: {
            pricingPlanId: pricingPlan.id,
          },
        });

        await sendEmail(
          user.email,
          'Plan Upgraded',
          sendEmailContent(user, 'INTERMEDIATE'),
        );
      }

      return createdOrder;
    },
    { timeout: 20000 },
  );

  return result;
};

const getAllOrders = async (filters: any) => {
  const {
    userId,
    status,
    startDate,
    endDate,
    destinationWarehouseId,
    minTotalPrice,
    maxTotalPrice,
    lockerId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;
  // Ensure valid pagination values
  const take = Math.max(1, Number(limit)); // Ensure minimum limit is 1
  const skip = Math.max(0, (Number(page) - 1) * take); // Prevent negative skip values

  // Construct filter conditions
  const whereConditions: any = {}; // Orders belonging to the user

  if (userId) whereConditions.userId = userId;
  if (status) whereConditions.status = status;
  if (destinationWarehouseId)
    whereConditions.destinationWarehouseId = destinationWarehouseId;
  if (lockerId) whereConditions.lockerId = lockerId;

  if (minTotalPrice !== undefined || maxTotalPrice !== undefined) {
    whereConditions.totalPrice = {
      ...(minTotalPrice !== undefined && { gte: minTotalPrice }),
      ...(maxTotalPrice !== undefined && { lte: maxTotalPrice }),
    };
  }

  if (startDate || endDate) {
    whereConditions.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  // Count total matching orders for pagination metadata
  const totalOrders = await prisma.order.count({ where: whereConditions });

  // Fetch paginated orders
  const orders = await prisma.order.findMany({
    where: whereConditions,
    include: {
      packages: {
        include: {
          ServicePackage: {
            include: {
              service: true,
            },
          },
        },
      },
      Payment: true,
      destinationWarehouse: true,
      user: {
        include: {
          locker: true,
          profile: true,
        },
      },
    },
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc',
    },
  });

  return {
    meta: {
      total: totalOrders,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalOrders / take),
    },
    data: orders,
  };
};

const getUserOrders = async (userId: string, filters: any) => {
  const {
    status,
    startDate,
    endDate,
    destinationWarehouseId,
    minTotalPrice,
    maxTotalPrice,
    lockerId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;
  // Ensure valid pagination values
  const take = Math.max(1, Number(limit)); // Ensure minimum limit is 1
  const skip = Math.max(0, (Number(page) - 1) * take); // Prevent negative skip values

  // Construct filter conditions
  const whereConditions: any = {}; // Orders belonging to the user

  if (userId) whereConditions.userId = userId;
  if (status) whereConditions.status = status;
  if (destinationWarehouseId)
    whereConditions.destinationWarehouseId = destinationWarehouseId;
  if (lockerId) whereConditions.lockerId = lockerId;

  if (minTotalPrice !== undefined || maxTotalPrice !== undefined) {
    whereConditions.totalPrice = {
      ...(minTotalPrice !== undefined && { gte: minTotalPrice }),
      ...(maxTotalPrice !== undefined && { lte: maxTotalPrice }),
    };
  }

  if (startDate || endDate) {
    whereConditions.createdAt = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  // Count total matching orders for pagination metadata
  const totalOrders = await prisma.order.count({ where: whereConditions });

  // Fetch paginated orders
  const orders = await prisma.order.findMany({
    where: whereConditions,
    include: {
      packages: {
        include: {
          ServicePackage: {
            include: {
              service: true,
            },
          },
        },
      },
      Payment: true,
      destinationWarehouse: true,
    },
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc',
    },
  });

  return {
    meta: {
      total: totalOrders,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalOrders / take),
    },
    data: orders,
  };
};

const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      packages: true,
      Payment: true,
      destinationWarehouse: true,
    },
  });

  if (!order) throw new AppError(httpStatus.NOT_FOUND, 'Order not found');

  return order;
};

const updateOrder = async (orderId: string, updateData: any) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // Check if destinationWarehouseId is being updated
  const updatePayload: any = {};

  if (updateData.totalWeight) {
    updatePayload.totalWeight = updateData.totalWeight;
  }

  if (updateData.totalPrice) {
    updatePayload.totalPrice = updateData.totalPrice;
  }

  if(updateData.note){
    updatePayload.note = updateData.note;
  }

  if (updateData.destinationWarehouseId) {
    updatePayload.destinationWarehouseId = updateData.destinationWarehouseId;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No valid fields to update');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updatePayload,
    include: {
      destinationWarehouse: true,
    },
  });

  return updatedOrder;
};

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  warehouseId: string,
) => {
  return prisma.$transaction(async tsx => {
    // Step 2: Retrieve Order with Packages
    const order = await tsx.order.findUnique({
      where: { id: orderId },
      include: {
        packages: true,
        user: true,
      },
    });

    let updatedOrder;

    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    if (!status) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Status not found');
    }

    const packages = order.packages;
    // console.log(order);

    if (status && warehouseId) {
      updatedOrder = await tsx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: status,
          destinationWarehouseId: warehouseId,
        },
      });

      const user = order.user;

      if (status === 'CARGO') {
        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderShipDate: new Date(),
          },
        });
        await sendEmail(
          user.email,
          'Your Order Update – Now with USPS Tracking!',
          `Hi,  

Great news! 🎉 Your order **#${orderId}** has been updated and has now been handed over to **USPS** for delivery.  

You’ll receive tracking details soon so you can monitor your shipment every step of the way. If you have any questions, feel free to reach out!  

Thank you for choosing **KoolBox**!  

Best regards,  
The KoolBox Team`,
        );
      }

      if (status === 'AGENT') {
        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderAgentDate: new Date(),
          },
        });

        await sendEmail(
            user.email,
            'Your Order Update – Now with Our Local Agent!',
            `Hi,  

Exciting news! 🎉 Your order **#${orderId}** has been updated and is now in the hands of our local agent in your country.  

You'll receive tracking details soon, allowing you to monitor your shipment every step of the way. If you have any questions or need assistance, feel free to reach out—we're happy to help!  

Thank you for choosing **KoolBox**!  

Best regards,  
The KoolBox Team`,
        );
      }

      if (status === 'OUT_FOR_DELIVERY') {
        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderOutForDeliveryDate: new Date(),
          },
        });

        await sendEmail(
            user.email,
            'Your Order is Out for Delivery! 🚚',
            `Hi,  

Good news! 🎉 Your order **#${orderId}** is now **out for delivery** and will be arriving soon.  

Please keep an eye out for your package, and if you have any questions or need to reschedule delivery, feel free to reach out.  

Thank you for choosing **KoolBox**! We appreciate your trust.  

Best regards,  
The KoolBox Team`,
        );
      }

      if (status === 'DELIVERED') {
        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderDeliveryDate: new Date(),
          },
        });

        await sendEmail(
            user.email,
            'Your Order Has Been Delivered! 🎉',
            `Hi,  

Great news! 🎉 Your order **#${orderId}** has been successfully **delivered**. We hope you love your purchase!  

If you have any questions or need assistance, feel free to reach out. We'd also love to hear your feedback!  

Thank you for choosing **KoolBox** – we appreciate your support!  

Best regards,  
The KoolBox Team`,
        );
      }
    }

    if (status && !warehouseId) {
      updatedOrder = await tsx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: status,
        },
      });

      if (status === 'CARGO') {
        for (const pack of packages) {
          await tsx.package.update({
            where: {
              id: pack.id,
            },
            data: {
              status: 'SHIPPED',
            },
          });
        }

        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderShipDate: new Date(),
          },
        });
      }

      if (status === 'AGENT') {
        for (const pack of packages) {
          await tsx.package.update({
            where: {
              id: pack.id,
            },
            data: {
              status: 'SHIPPED',
            },
          });
        }

        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderAgentDate: new Date(),
          },
        });
      }

      if (status === 'OUT_FOR_DELIVERY') {
        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderOutForDeliveryDate: new Date(),
          },
        });
      }

      if (status === 'DELIVERED') {
        for (const pack of packages) {
          await tsx.package.update({
            where: {
              id: pack.id,
            },
            data: {
              status: 'DELIVERED',
            },
          });
        }
        await tsx.orderHistory.update({
          where: {
            orderId,
          },
          data: {
            orderDeliveryDate: new Date(),
          },
        });
      }
    }

    return updatedOrder;
  });
};

const cancelOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new AppError(httpStatus.NOT_FOUND, 'Order not found');

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
  });
};

const deliveredOrder = async (orderId: string) => {
  // Using prisma.$transaction for atomic operations
  const result = await prisma.$transaction(async tsx => {
    // Update the order status to 'DELIVERED'
    const updatedOrder = await tsx.order.updateMany({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.DELIVERED,
      },
    });

    // Retrieve the updated order to check if it exists and get associated packages
    const order = await tsx.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        packages: true,
      },
    });

    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // Update the status of each package in the order to 'DELIVERED'
    const packages = order.packages;
    for (const pack of packages) {
      await tsx.package.update({
        where: {
          id: pack.id,
        },
        data: {
          status: PackageStatus.DELIVERED,
        },
      });
    }

    // Return the updated order after all changes
    return tsx.order.findUnique({
      where: {
        id: orderId,
      },
    });
  });

  return result;
};

const getOrderSummary = async () => {
  // 1. Get total orders count
  const totalOrders = await prisma.order.count();

  // 2. Get count of orders that are not delivered
  const undeliveredOrders = await prisma.order.count({
    where: { status: { not: 'DELIVERED' } },
  });

  // 3. Calculate total revenue of delivered orders
  const deliveredOrdersRevenue = await prisma.order.aggregate({
    where: { status: 'DELIVERED' },
    _sum: { totalPrice: true }, // Assuming `amount` field stores the order value
  });

  // 4. Get total users count
  const totalUsers = await prisma.user.count();

  return {
    totalOrders,
    undeliveredOrders,
    totalRevenue: deliveredOrdersRevenue._sum.totalPrice || 0,
    totalUsers,
  };
};

const getOrderHistory = async (orderId: string) => {
  return prisma.orderHistory.findUnique({
    where: {
      orderId,
    },
    include: {
      order: true,
    },
  });
};

export const orderService = {
  reviewOrder,
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrder,
  deliveredOrder,
  updateOrderStatus,
  getOrderSummary,
  cancelOrder,
  getOrderHistory,
};
