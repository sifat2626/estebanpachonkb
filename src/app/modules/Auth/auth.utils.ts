import prisma from '../../utils/prisma';

// Generate a unique lockerId with "KB" as a fixed prefix and numbers only
export const generateReferralId = async (): Promise<string> => {
  let referralCode: string = '';
  let isUnique = false;
  
  const generateRandomNumeric = (length: number): string => {
    const numbers = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += numbers.charAt(
        Math.floor(Math.random() * numbers.length),
      );
    }
    return result;
  };

  while (!isUnique) {
    referralCode = `KB-${generateRandomNumeric(8)}`; // Prefix "KB-" with a random 8-digit number
    const existingCode = await prisma.user.findUnique({
      where: { referralCode },
    });
    isUnique = !existingCode; // Ensure uniqueness by checking the database
  }

  return referralCode;
};
