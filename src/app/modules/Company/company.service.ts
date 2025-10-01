import prisma from "../../utils/prisma";
import { Company } from "@prisma/client";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

/**
 * Create a new company
 */
const createCompany = async (data: { createdBy: string; name: string; website?: string; logo: string }) => {
    const { createdBy, name, website, logo } = data;

    return prisma.company.create({
        data: {
            createdBy,
            name,
            website,
            logo,
        },
    });
};

/**
 * Get all companies
 */
const getCompanies = async () => {
    return prisma.company.findMany({
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Get a single company by ID
 */
const getCompanyById = async (id: string) => {
    const company = await prisma.company.findUnique({
        where: { id },
    });

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found");
    }

    return company;
};

/**
 * Update a company
 */
const updateCompany = async (id: string, data: Partial<Company>) => {
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found");
    }

    return prisma.company.update({
        where: { id },
        data,
    });
};

/**
 * Delete a company
 */
const deleteCompany = async (id: string) => {
    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found");
    }

    await prisma.company.delete({
        where: { id },
    });

    return { message: "Company deleted successfully" };
};

export const CompanyService = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
};
