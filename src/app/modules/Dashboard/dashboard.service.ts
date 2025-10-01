import prisma from '../../utils/prisma';
import { UserRoleEnum } from '@prisma/client';
import AppError from '../../errors/AppError';

const adminSummary = async () => {
  // Get the total number of shipments (orders)
  const totalShipments = await prisma.order.count();

  // Get the total number of pending orders
  const pendingOrders = await prisma.order.count({
    where: {
      status: 'PENDING',
    },
  });

  // Get today's revenue by summing payments created today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Start of today

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999); // End of today

  let todaysRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Get total revenue (sum of all payments)
  let totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
  });

  // Get the count of active users with the 'USER' role
  const activeUsers = await prisma.user.count({
    where: {
      role: UserRoleEnum.USER,
    },
  });

  // Return the summary data
  return {
    totalShipments,
    pendingOrders,
    activeUsers,
    todaysRevenue: todaysRevenue._sum.amount || 0,
    totalRevenue: totalRevenue._sum.amount || 0, // Include total revenue
  };
};

const paymentsSummary = async (startDate: Date, endDate: Date) => {
  let totalRevenue = 0;

  // Helper function to get an array of all dates between startDate and endDate
  const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    let endingDate = new Date(endDate);

    while (currentDate <= endingDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Get all dates between the start and end date
  const dates = getDatesInRange(startDate, endDate);

  // Fetch payments for each day
  const paymentsByDay = await Promise.all(
      dates.map(async date => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const payments = await prisma.payment.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        totalRevenue += payments._sum.amount || 0; // Accumulate total revenue

        return {
          date: date.toISOString().split('T')[0],
          revenue: payments._sum.amount || 0,
        };
      })
  );

  return { paymentsByDay, totalRevenue };
};

const agentSummary = async (userId: string) => {
  const agent = await prisma.agent.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!agent) {
    throw new AppError(400, 'Agent not found');
  }

  const totalOrders = await prisma.order.count({
    where: {
      destinationWarehouseId: agent.warehouseId,
    },
  });

  const upcomingOrders = await prisma.order.count({
    where: {
      destinationWarehouseId: agent.warehouseId,
      status: 'CARGO',
    },
  });

  const totalReceived = await prisma.order.count({
    where: {
      destinationWarehouseId: agent.warehouseId,
      status: 'AGENT',
    },
  });

  const totalDelivered = await prisma.order.count({
    where: {
      destinationWarehouseId: agent.warehouseId,
      status: 'AGENT',
    },
  });

  return { totalOrders, upcomingOrders, totalReceived, totalDelivered };
};



export const DashboardServices = {
  adminSummary,
  paymentsSummary,
  agentSummary,
};
