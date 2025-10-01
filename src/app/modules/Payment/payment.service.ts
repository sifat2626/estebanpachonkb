import prisma from '../../utils/prisma';

const getAllPayments = async () => {
  const payments = await prisma.payment.findMany({
    where: {},
    include: {
      User: {
        include: {
          profile: {
            include: {
              locker: true,
            },
          },
        },
      },
    },
  });
  return payments;
};

// Fetch a user's payments from the database
const getPaymentsByUser = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: { userId },
  });

  return payments;
};

export const PaymentServices = {
  getAllPayments,
  getPaymentsByUser,
};
