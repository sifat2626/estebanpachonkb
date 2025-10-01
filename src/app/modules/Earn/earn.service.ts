import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";

const updateEarn = async (value:number) => {
    const earn = await prisma.earn.findFirst({})

    if(!earn) {
        const result = await prisma.earn.create({
            data: {
                value
            }
        })

        return result
    }
    const result = await prisma.earn.update({
        where:{
            id:earn.id
        },
        data: {
            value
        }
    })
    return result;
}

const getEarn = async () => {
    const earn = await prisma.earn.findFirst({})
    if(!earn) {
        throw new AppError(400, 'Earning not found');
    }
    return earn;
}

export const EarnServices = {
    updateEarn,
    getEarn
}