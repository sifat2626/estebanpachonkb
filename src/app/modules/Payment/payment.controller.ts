import { Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { PaymentServices } from './payment.service';

const getAllPayments = catchAsync(async (req: Request, res: Response) => {

  const payments = await PaymentServices.getAllPayments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payments retrieved successfully',
    data: payments,
  });
});


// Get all payments made by a user
const getPaymentsByUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const payments = await PaymentServices.getPaymentsByUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payments retrieved successfully',
    data: payments,
  });
});

export const PaymentControllers = {
  getAllPayments,
  getPaymentsByUser,
};
