import { Level, User, UserRoleEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { generateReferralId } from '../Auth/auth.utils';
import { sendEmail } from '../../utils/sendEmail';
import httpStatus from 'http-status';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const generateOtp = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  return otp.toString();
};

const generateLockerId = async (city: string): Promise<string> => {
  // Find the last locker record ordered by createdAt in descending order
  const lastLocker = await prisma.locker.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
  });
  console.log({ lastLocker });

  // Extract the locker number or default to 0 if no record is found
  let lockerNumber = 0;

  if (lastLocker && lastLocker.code) {
    const numericPart = lastLocker.code.slice(3); // Assuming the format is "CITY001"
    // Ensure the numeric part is a valid number
    lockerNumber = isNaN(parseInt(numericPart)) ? 0 : parseInt(numericPart);
  }
  console.log({ lockerNumber });

  // Increment the locker number by 1 and pad with leading zeros to ensure it is always 3 digits
  const updatedLockerNumber = (lockerNumber + 1).toString().padStart(3, '0');
  console.log({ updatedLockerNumber });

  // Take the first three characters of the city name
  const cityPart = city.slice(0, 3).toUpperCase();

  // Combine the city part and updated locker number to create the lockerId
  const lockerId: string = cityPart + updatedLockerNumber;
  console.log({ lockerId });

  return lockerId;
};

const registerUserIntoDB = async (payload: User) => {
  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  let referredBy = null;
  if (payload.referralCode) {
    const referringUser = await prisma.user.findUnique({
      where: { referralCode: payload.referralCode },
    });

    if (!referringUser) {
      throw new Error('Invalid referral code.');
    }

    referredBy = referringUser.id;
  }

  // Generate referral code for the new user
  const newUserReferralCode = await generateReferralId();

  const result = await prisma.$transaction(async tsx => {
    const user = await tsx.user.create({
      data: {
        ...payload,
        referralCode: newUserReferralCode,
        referredBy,
        password: hashedPassword,
      },
    });

    await sendEmail(
      user.email,
      'Subject: ¡Bienvenido a Kool Box!',
      `<p>Hola,</p>
  <p>¡Gracias por registrarte en Kool Box! Estamos emocionados de tenerte como parte de nuestra comunidad y queremos asegurarnos de que tu experiencia con nuestro servicio de casillero virtual sea lo más sencilla y eficiente posible.</p>
  
  <h3>A continuación, te compartimos algunas recomendaciones básicas para que tus envíos lleguen sin contratiempos:</h3>
  
  <ul>
    <li><strong>Código de Locker:</strong> Tu código de locker único ya está asignado y lo puedes ver en tu perfil de usuario en nuestra plataforma. Asegúrate de incluir este código en todas tus compras o envíos. Este código es esencial para que podamos identificar rápidamente tus paquetes cuando lleguen a nuestras instalaciones.</li>
    <li><strong>Datos de Envío:</strong> Siempre verifica que la dirección de envío que proporcionas al hacer tus compras sea exactamente la que te hemos asignado. Incluye tu nombre completo y tu código de locker para evitar confusiones.</li>
    <li><strong>Comunicación:</strong> Si tienes alguna duda o necesitas asistencia, no dudes en contactarnos a través de nuestro número de WhatsApp: <a href="tel:+13058336713">+1 (305) 833-6713</a>. Estamos disponibles para ayudarte en lo que necesites.</li>
    <li><strong>Seguimiento de Paquetes:</strong> Te recomendamos mantener un registro de los números de seguimiento (tracking numbers) de tus compras para que puedas monitorear el estado de tus envíos.</li>
    <li><strong>Restricciones:</strong> Antes de realizar una compra, revisa nuestra lista de artículos restringidos para evitar inconvenientes con tus envíos. Puedes consultar esta información en nuestro sitio web o contactarnos directamente.</li>
  </ul>
  
  <p>Estamos aquí para hacer que tus compras internacionales sean más fáciles y seguras. ¡Esperamos que disfrutes de nuestro servicio!</p>
  
  <p>Bienvenido nuevamente,</p>
  <p>El equipo de Kool Box</p>
  <p>📧 <a href="mailto:info@koolbx.com">info@koolbx.com</a></p>
  <p>📞 <a href="tel:+13058336713">+1 (305) 833-6713</a></p>`,
    );

    // referral balance will add later when the referred user is perform any shipment

    // if (referredBy) {
    //   await tsx.user.update({
    //     where: { id: referredBy },
    //     data: {
    //       referralBalance: {
    //         increment: 5
    //       }
    //     }
    //   });
    // }
    return user;
  });

  const userWithOptionalPassword = result as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};

const createProfileIntoDB = async (userId: string, payload: any) => {
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: userId },
  });
  if (existingProfile) {
    throw new AppError(400, 'User with this email already exists');
  }

  if (payload.country) {
    payload.country = payload.country.toUpperCase();
  }
  const lockerId = await generateLockerId(payload.district);
  const profileData = {
    ...payload,
    userId,
  };

  return prisma.$transaction(async tsx => {
    const locker = await tsx.locker.create({
      data: {
        userId,
        code: lockerId,
      },
    });

    const pricingPlan = await tsx.pricingPlan.findFirst({
      where: {
        name: 'BEGINNER',
        country: payload.country,
      },
    });

    if (!pricingPlan) {
      throw new AppError(400, 'pricing plan not found');
    }

    await tsx.user.update({
      where: {
        id: userId,
      },
      data: {
        pricingPlanId: pricingPlan.id,
      },
    });

    const profile = await tsx.profile.create({
      data: { ...profileData, lockerId: locker.id },
    });

    return profile;
  });
};

const getAllUsersFromDB = async (query: any) => {
  const {
    limit = 10, // Default limit per page
    page = 1, // Default page number
    id,
  } = query;

  const whereConditions: any = {};

  if (id) {
    whereConditions['id'] = id;
  }

  // Pagination setup
  const take = Number(limit); // Number of users per page
  const skip = (Number(page) - 1) * take; // Skip the appropriate number of records

  // Count total users matching the filters
  const totalUsers = await prisma.user.count();

  // Get the paginated users with selected fields
  const users = await prisma.user.findMany({
    where: whereConditions,
    include:{
      profile:{
        include: {
          locker: true
        }
      }
    },
    skip,
    take,

  });

  // Return paginated data along with metadata
  return {
    meta: {
      total: totalUsers,
      limit: take,
      page: Number(page),
      totalPages: Math.ceil(totalUsers / take),
    },
    data: users,
  };
};

const getMyProfileFromDB = async (id: string) => {
  const profile = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      profile: {
        include: {
          locker: true,
        },
      },
      pricingPlan: true,
      Consolidate: {
        include: {
          packages: true,
        },
      },
      packages: {
        include: {
          ServicePackage: {
            include: {
              service: true,
            },
          },
        },
      },
      orders: true,
      payments: true,
    },
  });
  return profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    include:{
      profile: {
        include: {
          locker: true,
        }
      }
    }
  });
  return user;
};

const updateMyProfileIntoDB = async (id: string, payload: any) => {
  const userProfileData = payload.Profile;
  delete payload.Profile;

  const userData = payload;

  // Update user data and profile in a transaction
  await prisma.$transaction(async transactionClient => {
    await transactionClient.user.update({
      where: { id },
      data: userData,
    });

    await transactionClient.profile.update({
      where: { userId: id },
      data: userProfileData,
    });
  });

  // Fetch and return the updated user including the profile
  const updatedUser = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: { profile: true },
  });

  const userWithOptionalPassword = updatedUser as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};

const updateOrder = async (orderId: string, updateData: any) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
  });

  return updatedOrder;
};

const updateUserRoleStatusIntoDB = async (
  id: string,
  role: UserRoleEnum,
  warehouseId: string,
) => {
  console.log({ warehouseId, id, role });

  // Start a Prisma transaction
  const result = await prisma.$transaction(async prisma => {
    // Update the user's role
    const userUpdate = await prisma.user.update({
      where: { id },
      data: {
        role,
      },
    });

    // If role is 'AGENT', update the agent's warehouseId
    if (role === 'AGENT') {
      await prisma.agent.create({
        data: {
          userId: id,
          warehouseId,
        },
      });
    }

    return userUpdate; // Return the user update result
  });

  return result; // Return the transaction result
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });


  const isCorrectPassword: boolean = await bcrypt.compare(
    oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  console.log(userData, oldPassword, newPassword);
  const hashedPassword: string = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};

// Generate and send OTP for password reset
const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found with this email.');
  }

  // Generate a random 6-digit OTP
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

  // Store OTP and expiration in the user record
  await prisma.user.update({
    where: { email },
    data: {
      otp,
      otpExpiresAt,
    },
  });

  // Send OTP to user's email (you can implement this function)
  await sendEmail(
    user.email,
    'Password Reset OTP',
    `Your OTP for resetting the password is: ${otp}. It will expire in 15 minutes.`,
  );

  return { message: 'OTP sent to your email successfully.' };
};

// Reset the password using OTP
const resetPasswordWithOtp = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found with this email.');
  }

  // Check if the OTP is valid and not expired
  if (user.otp !== otp) {
    throw new Error('Invalid OTP.');
  }

  if (new Date() > new Date(user.otpExpiresAt as Date)) {
    throw new Error('OTP has expired.');
  }

  // Hash the new password before storing it
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update the user's password
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      otp: null, // Clear OTP after successful password reset
      otpExpiresAt: null, // Clear OTP expiration
    },
  });

  return { message: 'Password reset successfully.' };
};

const updateUserImage = async (userId: string, imageURL: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      image: imageURL,
    },
  });

  return user;
};
export const UserServices = {
  registerUserIntoDB,
  createProfileIntoDB,
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  updateOrder,
  updateUserRoleStatusIntoDB,
  changePassword,
  requestPasswordReset,
  resetPasswordWithOtp,
  updateUserImage,
};
