import prisma from "../../utils/prisma";

const createFulfillmentService = async (data: { fulfillmentText: string; fulfillmentText_es: string }) => {
    return prisma.fulfillment.create({ data });
};

const getFulfillmentsService = async () => {
    return prisma.fulfillment.findMany({ orderBy: { createdAt: "desc" } });
};

const getFulfillmentByIdService = async (id: string) => {
    return prisma.fulfillment.findUnique({ where: { id } });
};

const updateFulfillmentService = async (id: string, data: Partial<{ fulfillmentText: string; fulfillmentText_es: string }>) => {
    return prisma.fulfillment.update({ where: { id }, data });
};

const deleteFulfillmentService = async (id: string) => {
    return prisma.fulfillment.delete({ where: { id } });
};

export const FulfillmentService = {
    createFulfillment: createFulfillmentService,
    getFulfillments: getFulfillmentsService,
    getFulfillmentById: getFulfillmentByIdService,
    updateFulfillment: updateFulfillmentService,
    deleteFulfillment: deleteFulfillmentService,
};
