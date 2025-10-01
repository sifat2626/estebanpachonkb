import express from 'express';
import auth from '../../middlewares/auth';
import { UserRoleEnum } from '@prisma/client';
import { uploadSingle } from '../../utils/multer';
import { BannerControllers } from './banner.controller';

const router = express.Router();

router.post(
  '/',
  auth(UserRoleEnum.SUPERADMIN),
  uploadSingle,
  BannerControllers.createBanner,
);

router.get('/', BannerControllers.getAllBanners);

router.get('/:id', BannerControllers.getBannerById);

router.put(
  '/:id',
  auth(UserRoleEnum.SUPERADMIN),
  uploadSingle,
  BannerControllers.updateBanner,
);

router.delete(
  '/:id',
  auth(UserRoleEnum.SUPERADMIN),
  BannerControllers.deleteBanner,
);

export const BannerRoutes = router;
