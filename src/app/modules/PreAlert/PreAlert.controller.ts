import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { PreAlertServices } from './PreAlert.service';
import AppError from '../../errors/AppError';
import { uploadImageToSpaces } from '../../utils/uploadImage';
import prisma from '../../utils/prisma';

const createPreAlert = catchAsync(async (req, res) => {
  const userId = req.user.id;

  let bodyData;
  
  try {
    bodyData = JSON.parse(req.body.data);
  } catch (error) {
    throw new AppError(400, 'Invalid JSON in request body.');
  }

  // Access the files using req.files
  const { invoice, image } = req.files as {
    invoice: Express.Multer.File[];
    image?: Express.Multer.File[];
  };

  console.log(invoice, image);

  // Ensure the invoice file is present (mandatory)
  if (!invoice || !invoice[0]) {
    throw new AppError(400, 'Invoice not found!');
  }

  // Handle uploading the invoice file
  let invoiceUrl: string = await uploadImageToSpaces(invoice[0]);
  let imageUrl: string = '';

  // Handle uploading the optional image file, if provided
  if (image && image[0]) {
    imageUrl = await uploadImageToSpaces(image[0]);
  }


  const result = await PreAlertServices.createPreAlertInDB(
    userId,
    bodyData,
    invoiceUrl,
    imageUrl,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Pre-Alert created successfully',
    data: result,
  });
});

const getPreAlertsByMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await PreAlertServices.getPreAlertsByMe(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Pre-Alerts retrieved successfully',
    data: result,
  });
})


export const PreAlertControllers = {
  createPreAlert,
  getPreAlertsByMe
};
