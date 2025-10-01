import express from 'express';
import auth from '../../middlewares/auth';
import { PreAlertControllers } from './PreAlert.controller';
import { uploadMiddleware } from '../../utils/multer';

const router = express.Router();

router.post(
  '/',
  auth('USER'),
  uploadMiddleware,
  PreAlertControllers.createPreAlert,
);

router.get('/me', auth('USER'), PreAlertControllers.getPreAlertsByMe);

export const PreAlertRouters = router;
