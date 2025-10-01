import { sendEmail } from '../../utils/sendEmail';
import { UserRoleEnum } from '@prisma/client';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import config from '../../../config';

const contact = async (userId: string, subject: string, message: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(400, 'User not found');
  }

  const adminEmail = config.sender_email;

  const messageHtml = `
  Email from: ${user.email} <br>
  Subject: ${subject} <br>
  Name: ${user.name} <br>
    ${message}
    `;

  const result = await sendEmail(adminEmail, subject, messageHtml);
};

export const ContactServices = {
  contact,
};
