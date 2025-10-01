import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { orderService } from './Order.service';
import prisma from '../../utils/prisma';
import AppError from "../../errors/AppError";

const reviewOrder = catchAsync(async (req, res) => {
  const userId = req.user.id || {};
  const { packageIds } = req.body;
  let packages = [];

  console.log(packageIds);

  for (const packageId of packageIds) {
    const pack = await prisma.package.findUnique({ where: { id: packageId } });

    if(!pack) {
      throw new AppError(400,`Unable to find package with id ${packageId}`);
    }

    packages.push(pack);
  }
  const newOrder = await orderService.reviewOrder(packages,userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'order review sent successfully',
    data: newOrder,
  });
});

const createOrder = catchAsync(async (req, res) => {
  const userId = req.user.id || {};
  const payload = req.body;
  const newOrder = await orderService.createOrder(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'order created successfully',
    data: newOrder,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const filters = req.query;
  const orders = await orderService.getAllOrders(filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Orders retrieved successfully',
    data: orders,
  });
});

const getUserOrders = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const filters = req.query;
  const orders = await orderService.getUserOrders(userId,filters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Orders retrieved successfully',
    data: orders,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order retrieved successfully',
    data: order,
  });
});

const updateOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedOrder = await orderService.updateOrder(id, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order updated successfully',
    data: updatedOrder,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, warehouseId } = req.body;
  const updatedOrder = await orderService.updateOrderStatus(
    id,
    status,
    warehouseId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order status updated successfully',
    data: updatedOrder,
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.cancelOrder(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order cancelled successfully',
    data: result,
  });
});

const getOrderSummary = catchAsync(async (req, res) => {
  const summary = await orderService.getOrderSummary();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order summary retrieved successfully',
    data: summary,
  });
});

const getOrderHistory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.getOrderHistory(id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Order history retrieved successfully',
    data: result,
  });
})

export const orderController = {
  reviewOrder,
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderSummary,
  getOrderHistory
};
