import prisma from "../../utils/prisma";

/**
 * About Us Service
 */
const createAboutUsService = async (data: { aboutText: string; aboutText_es: string }) => {
    return prisma.aboutUs.create({ data });
};

const getAboutUsService = async () => {
    return prisma.aboutUs.findFirst();
};

const updateAboutUsService = async (data: Partial<{ aboutText: string; aboutText_es: string }>) => {
    return prisma.aboutUs.update({ where: { id: "default" }, data });
};

export const AboutUsService = {
    createAboutUs: createAboutUsService,
    getAboutUs: getAboutUsService,
    updateAboutUs: updateAboutUsService,
};