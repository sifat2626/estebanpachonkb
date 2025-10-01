import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AgentServices } from './agent.service';
import {OrderStatus} from "@prisma/client";
import AppError from "../../errors/AppError";

const createAgent = catchAsync(async (req, res) => {
  const agentData = req.body;
  const result = await AgentServices.createAgent(agentData);
  sendResponse(res, {
    statusCode: 201,
    message: 'Agent created successfully',
    data: result,
  });
});

const getAllAgents = catchAsync(async (req, res) => {
  const result = await AgentServices.getAllAgents(req.query);
  sendResponse(res, {
    statusCode: 200,
    message: 'Agents retrieved successfully',
    data: result,
  });
});

const getAgentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AgentServices.getAgentById(id);
  sendResponse(res, {
    statusCode: 200,
    message: 'Agent retrieved successfully',
    data: result,
  });
});

const updateAgent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const result = await AgentServices.updateAgent(id, updatedData);
  sendResponse(res, {
    statusCode: 200,
    message: 'Agent updated successfully',
    data: result,
  });
});

const deleteAgent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AgentServices.deleteAgent(id);
  sendResponse(res, {
    statusCode: 200,
    message: 'Agent deleted successfully',
    data: result,
  });
});

const ordersByAgent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { status } = req.params;

  if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
    throw new AppError(400, 'Invalid order status');
  }

  const result = await AgentServices.ordersByAgent(userId, status as OrderStatus);
  sendResponse(res, {
    statusCode: 200,
    message: 'Orders retrieved successfully',
    data: result,
  });
});

const updateOrderByAgent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { orderId,status, prevStatus } = req.body;
  const result = await AgentServices.updateOrderByAgent(
    userId,
    orderId,
    status,
  );
  sendResponse(res, {
    statusCode: 200,
    message: 'Orders retrieved successfully',
    data: result,
  });
});

export const AgentControllers = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  updateOrderByAgent,
  ordersByAgent,
};
