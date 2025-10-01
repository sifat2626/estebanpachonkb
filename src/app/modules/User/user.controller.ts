import httpStatus from 'http-status';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import AppError from "../../errors/AppError";
import {uploadImageToSpaces} from "../../utils/uploadImage";

const registerUser = catchAsync(async (req, res) => {
  const result = await UserServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const result = await UserServices.getMyProfileFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getUserDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getUserDetailsFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User details retrieved successfully',
    data: result,
  });
});

const createProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await UserServices.createProfileIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Profile created successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const result = await UserServices.updateMyProfileIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateUserRoleStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {role,warehouseId} = req.body
  const result = await UserServices.updateUserRoleStatusIntoDB(id, role, warehouseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User role and status updated successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const {oldPassword, password} = req.body;
  const result = await UserServices.changePassword(userId, oldPassword, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

const updateUserImage = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const image = req.file as Express.Multer.File || {};

  if(!image) {
    throw new AppError(httpStatus.BAD_REQUEST, 'image is required');
  }

  const imageURL = await uploadImageToSpaces(image);
  const result = await UserServices.updateUserImage(userId, imageURL);

  sendResponse(res, {
    statusCode:httpStatus.CREATED,
    message:'photo updated successfully',
    data: result,
  })
})

const requestPasswordReset = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.requestPasswordReset(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password reset OTP sent successfully',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await UserServices.resetPasswordWithOtp(email, otp, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
    data: result,
  });
});

export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  getUserDetails,
  createProfile,
  updateMyProfile,
  updateUserRoleStatus,
  changePassword,
  requestPasswordReset,
  resetPassword,
  updateUserImage
};
