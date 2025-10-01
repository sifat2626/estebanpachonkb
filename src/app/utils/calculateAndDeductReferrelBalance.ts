import AppError from "../errors/AppError";
import httpStatus from "http-status";
import prisma from "./prisma";

export const calculateAndDeductReferralBalance = async (
    userId: string,
    referralBalanceToUse: number = 0,
): Promise<number> => {

    // Fetch the user and validate
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'User not found');

    // Ensure sufficient referral balance
    if (user.referralBalance < referralBalanceToUse) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Insufficient referral balance');
    }

    // Deduct referral balance
    await prisma.user.update({
        where: { id: userId },
        data: {
            referralBalance: user.referralBalance - referralBalanceToUse,
        },
    });

    return referralBalanceToUse; // Return the deducted amount for further calculations
};
