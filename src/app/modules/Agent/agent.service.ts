import prisma from '../../utils/prisma';
import { Agent, OrderStatus } from '@prisma/client';
import { isDataReferenced } from '../../utils/checkReference';
import AppError from '../../errors/AppError';
import { orderService } from '../Order/Order.service';
import { sendEmail } from '../../utils/sendEmail';

const createAgent = async (agentData: Agent) => {
  const result = await prisma.agent.create({
    data: agentData,
    include: {
      User: true, // Include related User data
      Warehouse: true, // Include related Warehouse data
    },
  });
  return result;
};

const getAllAgents = async (query: any) => {
  const {
    limit = 10, // Default limit per page
    page = 1, // Default page number
  } = query;

  // Pagination setup
  const take = Number(limit); // Number of agents per page
  const skip = (Number(page) - 1) * take; // Skip the appropriate number of records

  // Count total agents matching the filters
  const totalAgents = await prisma.agent.count();

  // Get the paginated agents with related User and Warehouse data
  const agents = await prisma.agent.findMany({
    skip,
    take,
    include: {
      User: true, // Include related User data
      Warehouse: true, // Include related Warehouse data
    },
  });

  // Return paginated data along with metadata
  return {
    meta: {
      total: totalAgents,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalAgents / take),
    },
    data: agents,
  };
};

const getAgentById = async (id: string) => {
  const result = await prisma.agent.findUnique({
    where: { id },
    include: {
      User: true, // Include related User data
      Warehouse: true, // Include related Warehouse data
    },
  });
  return result;
};

const updateAgent = async (id: string, updatedData: Partial<Agent>) => {
  const result = await prisma.agent.update({
    where: { id },
    data: updatedData,
    include: {
      User: true, // Include related User data
      Warehouse: true, // Include related Warehouse data
    },
  });
  return result;
};

const deleteAgent = async (id: string) => {
  const result = await prisma.agent.delete({
    where: { id },
    include: {
      User: true, // Optionally include related User data before deletion
      Warehouse: true, // Optionally include related Warehouse data before deletion
    },
  });

  return result;
};

const ordersByAgent = async (userId: string, status: OrderStatus) => {
  // Find the agent based on the userId
  const agent = await prisma.agent.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!agent) {
    throw new AppError(400, 'User Not Found');
  }

  // Fetch orders based on status and agent's warehouseId
  const orders = await prisma.order.findMany({
    where: {
      status,
      destinationWarehouseId: agent.warehouseId,
    },
    include: {
      packages: true,
      user: {
        include: {
          locker: true,
          profile: true,
        },
      },
    },
  });

  return orders;
};

const updateOrderByAgent = async (
  userId: string,
  orderId: string,
  status: OrderStatus,
) => {
  // Start a Prisma transaction
  const result = await prisma.$transaction(async prisma => {
    // Find the agent based on the user ID
    const agent = await prisma.agent.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!agent) {
      throw new AppError(400, 'User Not Found');
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        packages: true,
      },
    });

    if (!order) {
      throw new AppError(400, 'Order Not Found');
    }

    if (order.destinationWarehouseId !== agent.warehouseId) {
      throw new AppError(400, 'this order is not for this agent');
    }

    // Update the orders based on the agent's warehouseId and the previous status
    const updateResult = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    });

    const packages = order.packages;

    if (!packages) {
      throw new AppError(400, 'Package Not Found');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(400, 'User Not Found');
    }

    if (status === 'CARGO') {
      for (const pack of packages) {
        await prisma.package.update({
          where: {
            id: pack.id,
          },
          data: {
            status: 'SHIPPED',
          },
        });
      }

      await prisma.orderHistory.update({
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
      for (const pack of packages) {
        await prisma.package.update({
          where: {
            id: pack.id,
          },
          data: {
            status: 'SHIPPED',
          },
        });
      }

      await prisma.orderHistory.update({
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
      await prisma.orderHistory.update({
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
      for (const pack of packages) {
        await prisma.package.update({
          where: {
            id: pack.id,
          },
          data: {
            status: 'DELIVERED',
          },
        });
      }

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

      await prisma.orderHistory.update({
        where: {
          orderId,
        },
        data: {
          orderDeliveryDate: new Date(),
        },
      });
    }

    if (!updateResult) {
      throw new AppError(
        404,
        'No orders found with the given status and warehouse',
      );
    }

    return updateResult; // Return the result of the update
  });
  return result; // Return the transaction result
};

export const AgentServices = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  ordersByAgent,
  updateOrderByAgent,
};
