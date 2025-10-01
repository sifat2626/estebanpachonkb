


import express from 'express';
import auth from '../../middlewares/auth';
import { uploadVideo } from "../../utils/multer";
import { BlogController } from './Blog.controller';

const router = express.Router();

router.post(
    '/',
    // auth('ADMIN'),
    uploadVideo,
    BlogController.createBlog
);

router.get(
    '/',
    BlogController.getBlogs
);

router.get(
    '/:id',
    BlogController.getBlog
);

router.patch(
    '/:id',
    // auth('ADMIN'),
    uploadVideo,
    BlogController.updateBlog
);

router.delete(
    '/:id',
    // auth('ADMIN'),
    BlogController.deleteBlog
);

export const BlogRoute = router;