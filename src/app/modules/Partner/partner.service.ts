import prisma from "../../utils/prisma";
import { Partner } from "@prisma/client";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

/**
 * Create a new partner
 */
const createPartner = async (data: { createdBy: string; name: string; website?: string; logo: string }) => {
    const { createdBy, name, website, logo } = data;

    return prisma.partner.create({
        data: {
            createdBy,
            name,
            website,
            logo,
        },
    });
};

/**
 * Get all partners
 */
const getPartners = async () => {
    return prisma.partner.findMany({
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Get a single partner by ID
 */
const getPartnerById = async (id: string) => {
    const partner = await prisma.partner.findUnique({
        where: { id },
    });

    if (!partner) {
        throw new AppError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return partner;
};

/**
 * Update a partner
 */
const updatePartner = async (id: string, data: Partial<Partner>) => {
    const partner = await prisma.partner.findUnique({ where: { id } });

    if (!partner) {
        throw new AppError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return prisma.partner.update({
        where: { id },
        data,
    });
};

/**
 * Delete a partner
 */
const deletePartner = async (id: string) => {
    const partner = await prisma.partner.findUnique({ where: { id } });

    if (!partner) {
        throw new AppError(httpStatus.NOT_FOUND, "Partner not found");
    }

    await prisma.partner.delete({
        where: { id },
    });

    return { message: "Partner deleted successfully" };
};

export const PartnerService = {
    createPartner,
    getPartners,
    getPartnerById,
    updatePartner,
    deletePartner,
};
