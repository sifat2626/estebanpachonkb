import prisma from "../../utils/prisma";
import { FAQ } from "@prisma/client";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

/**
 * Create a new FAQ
 */
const createFAQ = async (data: { createdBy: string; question: string;question_es:string; answer: string;answer_es:string }) => {
    const { createdBy, question,question_es, answer,answer_es } = data;

    // Create the FAQ entry in the database
    return prisma.fAQ.create({
        data: {
            createdBy,
            question,
            question_es,
            answer,
            answer_es
        }
    });
};

/**
 * Get all FAQs
 */
const getFAQs = async () => {
    return  prisma.fAQ.findMany({
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Get a single FAQ by ID
 */
const getFAQById = async (id: string) => {
    const faq = await prisma.fAQ.findUnique({
        where: { id },
    });

    if (!faq) {
        throw new AppError(httpStatus.NOT_FOUND, "FAQ not found");
    }

    return faq;
};

/**
 * Update an FAQ
 */
const updateFAQ = async (id: string, data: Partial<FAQ>) => {
    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
        throw new AppError(httpStatus.NOT_FOUND, "FAQ not found");
    }

    return prisma.fAQ.update({
        where: { id },
        data,
    });
};

/**
 * Delete an FAQ
 */
const deleteFAQ = async (id: string) => {
    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
        throw new AppError(httpStatus.NOT_FOUND, "FAQ not found");
    }

    await prisma.fAQ.delete({
        where: { id },
    });

    return { message: "FAQ deleted successfully" };
};

export const FAQService = {
    createFAQ,
    getFAQs,
    getFAQById,
    updateFAQ,
    deleteFAQ,
};
