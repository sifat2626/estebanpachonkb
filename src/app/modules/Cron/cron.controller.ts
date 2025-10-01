import cron from 'node-cron';
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import {UserRoleEnum} from "@prisma/client";

// Schedule the task to run at midnight on December 31st
const cronSchedule =  ()=> cron.schedule('0 0 31 12 *', async () => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role:UserRoleEnum.USER
            }
        })
        for(const user of users){
            const profile = await prisma.profile.findUnique({
                where:{
                    userId: user.id,
                }
            })

            if(!profile){
                continue;
            }

            const beginnerPlan = await prisma.pricingPlan.findFirst({
                where: { name: 'BEGINNER', country:profile.country },
            });

            if (!beginnerPlan) {
                throw new AppError(400,"No beginner found with this id");
            }

            // Update all users' pricing plan to Beginner
            const updateResult = await prisma.user.update({
                where:{
                    id: user.id,
                },
                data: {
                    pricingPlanId: beginnerPlan.id, // Update the pricingPlanId to Beginner
                    packageCount:0
                },
            });
        }
        console.log(`Successfully reset users to the Beginner plan!`);

    } catch (error) {
        console.error('Error resetting user plans:', error);
    }
});


export const CronControllers = {
    cronSchedule,
}