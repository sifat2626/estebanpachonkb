import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadImageToSpaces } from '../../utils/uploadImage';
import { BannerServices } from './banner.service';

const createBanner = catchAsync(async (req, res) => {
  const image = req.file;

  if (!image) {
    throw new AppError(400, 'Image not found!');
  }

  const imageUrl = await uploadImageToSpaces(image);

  if (!imageUrl) {
    throw new AppError(400, 'Image not found!');
  }
  const banner = await BannerServices.createBanner(imageUrl);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Banner created successfully',
    data: banner,
  });
});

const getAllBanners = catchAsync(async (req, res) => {
  const banners = await BannerServices.getAllBanners();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: banners,
  });
});

const getBannerById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const banner = await BannerServices.getBannerById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    data: banner,
  });
});

const updateBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  const image = req.file;

  if (!image) {
    throw new AppError(400, 'Image not found!');
  }

  const imageUrl = await uploadImageToSpaces(image);

  if (!imageUrl) {
    throw new AppError(400, 'Image not found!');
  }
  const banner = await BannerServices.updateBanner(id, imageUrl);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Banner updated successfully',
    data: banner,
  });
});

const deleteBanner = catchAsync(async (req, res) => {
  const { id } = req.params;
  await BannerServices.deleteBanner(id);

  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Banner deleted successfully',
    data: null,
  });
});

export const BannerControllers = {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
