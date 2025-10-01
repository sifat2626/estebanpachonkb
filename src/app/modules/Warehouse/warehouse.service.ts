import prisma from "../../utils/prisma";
import { Warehouse } from "@prisma/client";
import {isDataReferenced} from "../../utils/checkReference";

const createWarehouse = async (warehouseData: Warehouse) => {
    const result = await prisma.warehouse.create({
        data: warehouseData,
    });
    return result;
};

const getAllWarehouses = async (query: any) => {
    const {
        limit = 10,              // Default limit per page
        page = 1,                // Default page number
        country,                 // Optional: Filter by country
        city,                    // Optional: Filter by city
        address,                 // Optional: Filter by address
    } = query;

    const filters: any = {};

    // Apply filters if provided
    if (country) {
        filters.country = {
            contains: country,
            mode: 'insensitive',
        };
    }

    if (city) {
        filters.city = {
            contains: city,
            mode: 'insensitive',
        };
    }

    if (address) {
        filters.address = {
            contains: address,
            mode: 'insensitive',
        };
    }

    // Pagination setup
    const take = Number(limit);                // Number of warehouses per page
    const skip = (Number(page) - 1) * take;    // Skip the appropriate number of records

    // Count total warehouses matching the filters
    const totalWarehouses = await prisma.warehouse.count({
        where: filters,
    });

    // Get the paginated warehouses with filters applied
    const warehouses = await prisma.warehouse.findMany({
        where: filters,
        skip,
        take,
    });

    // Return paginated data along with metadata
    return {
        meta: {
            total: totalWarehouses,
            limit: take,
            page: Number(page),
            totalPages: Math.ceil(totalWarehouses / take),
        },
        data: warehouses,
    };
};

const getWarehouseById = async (id: string) => {
    const result = await prisma.warehouse.findUnique({
        where: { id },
    });
    return result;
};

const updateWarehouse = async (id: string, updatedData: Partial<Warehouse>) => {
    const result = await prisma.warehouse.update({
        where: { id },
        data: updatedData,
    });
    return result;
};

const deleteWarehouse = async (id: string) => {
    const isReferenced = await isDataReferenced("Warehouse", "id", id, [
        { model: "Agent", field: "warehouseId" },
        { model: "Order", field: "destinationWarehouseId" }, // Check if any Package references this Warehouse
    ]);

    if (isReferenced) {
        throw new Error("Cannot delete this Warehouse as it is referenced in other records.");
    }
    const result = await prisma.warehouse.delete({
        where: { id },
    });
    return result;
};

export const WarehouseServices = {
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
};
