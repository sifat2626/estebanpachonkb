import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import {ContactServices} from "./contact.service";

const contact = catchAsync(async (req,res)=>{
    const userId = req.user.id
    const {title,message} = req.body;
    const result = await ContactServices.contact(userId,title,message);

    sendResponse(res, {
        statusCode:200,
        message:'contact successful',
        data:result
    })
})

export const ContactController = {
    contact,
}