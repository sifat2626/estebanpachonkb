import catchAsync from "../../utils/catchAsync";
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import sendResponse from "../../utils/sendResponse";

const calculate = catchAsync(async (req, res) => {
    const {weight,serviceIds} = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where:{
            id: userId,
        },include:{
            pricingPlan:true
        }
    })

    if(!user){
        throw new AppError(400,"User not found!");
    }

    if(!user.pricingPlan){
        throw new AppError(400,"Pricing not found!");
    }

    const pricingPlan = user.pricingPlan.baseRate;

    if(!pricingPlan){
        throw new AppError(400,"No pricing plan!");
    }

    let serviceFee = 0;
    if(serviceIds){

        console.log({serviceIds});
        for(const sId of serviceIds){
            const service = await prisma.service.findUnique({
                where:{
                    id:sId,
                }
            })

            if(!service){
                throw new AppError(400,"Service not found!");
            }

            serviceFee+= service.price
        }
    }

    const calculatedPrice = weight* pricingPlan + serviceFee;

    console.log("calculatedPrice", calculatedPrice,weight,pricingPlan,serviceFee);

    sendResponse(res,{
        statusCode:200,
        message:"price calculated successfully",
        data:calculatedPrice
    })
})

export const CalculatorController = {
    calculate
}