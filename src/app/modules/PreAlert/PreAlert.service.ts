import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import { Package, PackageStatus} from "@prisma/client";

const createPreAlertInDB = async (userId: string, payload: Package,invoiceUrl:string,imageUrl:string) => {

    const locker = await prisma.locker.findUnique({
        where:{
            userId
        }
    })
    if(!locker){
        throw new AppError(400,'locker not found')
    }

    const user = await prisma.user.findUnique({
        where:{
            id: userId,
        }
    })


    if(!user){
        throw new AppError(400,'user not found')
    }

    const trackingNo = payload.trackingNumber;

    console.log(trackingNo);

    const existingTrackingNo = await prisma.package.findFirst({
        where:{
            trackingNumber:trackingNo
        }
    })

    if(existingTrackingNo){
        throw new AppError(400, 'tracking number already exists')
    }

    const pricingPlanId = user.pricingPlanId

    if(!pricingPlanId){
        throw new AppError(400, 'pricing planId not found');
    }
    
    console.log({payload})

    const preAlertData = {
        userId,
        packageDetails: payload.packageDetails,
        vendorName: payload.vendorName,
        trackingNumber: payload.trackingNumber,
        note: payload.note,
        image: imageUrl,
        invoice: invoiceUrl,
        status:PackageStatus.ALERTED,
        orderType:payload.orderType,
    };

    const preAlert = await prisma.package.create({
        data: preAlertData,
    });

    return preAlert;
};

const getPreAlertsByMe = async (userId:string) => {
    const preAlerts = await prisma.package.findMany({
        where:{
            userId,
            status:'ALERTED'
        }
    })

    return preAlerts;
}

export const PreAlertServices = {
    createPreAlertInDB,
    getPreAlertsByMe
};
