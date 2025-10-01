import prisma from './prisma';
import { PaymentType } from '@prisma/client';
import AppError from '../errors/AppError';

export const checkPayment = async (userId: string) => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // console.log(userId);

  // Find the first payment for the user of type PLAN that hasn't expired
  const payment = await prisma.payment.findFirst({
    where: {
      userId: userId,
      type: PaymentType.PLAN,
    },
  });

  console.log(payment);
  if (!payment) {
    throw new AppError(400, "Payment not found or has expired");
  }

  return payment;
};
