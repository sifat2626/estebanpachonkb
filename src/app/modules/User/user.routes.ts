import express from 'express';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';
import {uploadSingle} from "../../utils/multer";

const router = express.Router();

router.post(
    '/register',
    UserControllers.registerUser,
);

router.get(
    '/',
    auth('SUPERADMIN', 'ADMIN'),
    UserControllers.getAllUsers,
);

router.get(
    '/me',
    auth(),
    UserControllers.getMyProfile,
);

router.get(
    '/:id',
    auth('SUPERADMIN', 'ADMIN'),
    UserControllers.getUserDetails,
);

router.post(
    '/create-profile',
    auth('USER', 'ADMIN','SUPERADMIN'),
    UserControllers.createProfile,
);

router.put(
    '/update-profile',
    auth('USER', 'ADMIN','SUPERADMIN'),
    UserControllers.updateMyProfile,
);

router.put(
    '/update-user/:id',
    auth('ADMIN','SUPERADMIN'),
    UserControllers.updateUserRoleStatus,
);

router.put(
    '/update-image',
    auth(),
    uploadSingle,
    UserControllers.updateUserImage,
);

router.post(
    '/change-password',
    auth(),
    UserControllers.changePassword,
);

// Request OTP for password reset
router.post(
    '/request-password-reset',
    UserControllers.requestPasswordReset,
);

// Reset password with OTP
router.post(
    '/reset-password',
    UserControllers.resetPassword,
);

export const UserRouters = router;
