
import pickValidFields from "../../utils/pickValidFields";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/AppError";
import { blogService } from "./Blog.service";
import { Request, Response } from "express";
import httpStatus from "http-status";

const createBlog = catchAsync(async (req: Request, res: Response) => {

    const data = JSON.parse(req.body.data);
    const video = req.file as Express.Multer.File || {};

    if (!video) {
        throw new AppError(httpStatus.BAD_REQUEST, 'video is required');
    }

    const result = await blogService.createBlog(data, video);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'blog created successfully',
        data: result,
    });
});

const getBlogs = catchAsync(async (req: Request, res: Response) => {
    const options = pickValidFields(req.query, ['limit', 'page', 'sortBy', 'sortOrder'])
    const result = await blogService.getBlogs(options,);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'blogs retrieved successfully',
        data: result,
    });
});

const getBlog = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await blogService.getBlog(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'blog retrieved successfully',
        data: result,
    });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const data = JSON.parse(req.body.data || '{}');

    const video = req.file as Express.Multer.File; 

    const result = await blogService.updateBlog(id, data, video);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'blog updated successfully',
        data: result,
    });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await blogService.deleteBlog(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'blog deleted successfully',
        data: null,
    });
});

export const BlogController = {
    createBlog,
    getBlogs,
    getBlog,
    updateBlog,
    deleteBlog
}