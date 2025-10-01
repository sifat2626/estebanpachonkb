import { Blog } from "@prisma/client";
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interface/pagination.type";
import { calculatePagination } from "../../utils/calculatePagination";
import { removeFileFromSpaces, uploadImageToSpaces } from "../../utils/uploadImage";

const createBlog = async (blog: Blog, video: Express.Multer.File) => {

    const isExit = await prisma.blog.findFirst({
        where: {
            title: blog.title
        }
    });

    if (isExit) {
        throw new AppError(httpStatus.CONFLICT, 'Blog already exist with the same title');
    };

    const videoUrl = await uploadImageToSpaces(video);

    blog.video = videoUrl;

    const newBlog = await prisma.blog.create({
        data: blog
    });

    return newBlog;
}

const getBlog = async (id: string) => {
    const blog = await prisma.blog.findFirst({
        where: {
            id
        }
    });

    if (!blog) {
        throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    return blog;
}

const getBlogs = async (options: IPaginationOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

    const total = await prisma.blog.count();

    const meta = {
        page,
        limit,
        total,
    }

    const blogs = await prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    return { meta, data: blogs };
}

const updateBlog = async (id: string, blog: Partial<Blog>, video?: Express.Multer.File) => {

    const isExit = await prisma.blog.findUnique({
        where: {
            id
        }
    })

    if (!isExit) {
        throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
    }
    if (video) {
        console.log("video from condition", video);
        const videoUrl = await uploadImageToSpaces(video);
        blog.video = videoUrl;
    }

    const updatedBlog = await prisma.blog.update({
        where: {
            id
        },
        data: blog
    });

    return updatedBlog;
}

const deleteBlog = async (id: string) => {
    const isExist = await prisma.blog.findUnique({
        where: {
            id
        }
    })

    if (!isExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
    }

    if(isExist.video){
        await removeFileFromSpaces(isExist.video);
    }

    await prisma.blog.delete({
        where: {
            id
        }
    });

    return;
}

export const blogService = {
    createBlog, 
    getBlog,
    getBlogs,
    updateBlog,
    deleteBlog

}