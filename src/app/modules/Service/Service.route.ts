
import express from 'express';
import auth from '../../middlewares/auth'; 
import {uploadMiddleware, uploadSingle} from "../../utils/multer";
import { estabanServiceController } from './Service.controller';
import {UserRoleEnum} from "@prisma/client";

const router = express.Router();

router.post(
    '/',
    auth('ADMIN','SUPERADMIN'),
    uploadSingle, 
    estabanServiceController.createService
);

router.post(
    '/consolidation',
    auth('USER'),
    estabanServiceController.consolidationService
);

router.get(
    '/',
    estabanServiceController.getServices
);

router.get(
    '/:id',
    estabanServiceController.getService
);

router.patch(
    '/:id',
    auth('ADMIN','SUPERADMIN'),
    uploadMiddleware,
    estabanServiceController.updateService
);

router.delete(
    '/:id',
    auth('ADMIN','SUPERADMIN'),
    estabanServiceController.deleteService
);

router.post('/take',auth(UserRoleEnum.USER), estabanServiceController.takeService);



export const ServiceRoute = router;