import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { WarehouseServices } from "./warehouse.service";

const createWarehouse = catchAsync(async (req, res) => {
    const warehouseData = req.body;
    const result = await WarehouseServices.createWarehouse(warehouseData);
    sendResponse(res, {
        statusCode: 201,
        message: "Warehouse created successfully",
        data: result,
    });
});

const getAllWarehouses = catchAsync(async (req, res) => {
    const result = await WarehouseServices.getAllWarehouses(req.query);
    sendResponse(res, {
        statusCode: 200,
        message: "Warehouses retrieved successfully",
        data: result,
    });
});

const getWarehouseById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WarehouseServices.getWarehouseById(id);
    sendResponse(res, {
        statusCode: 200,
        message: "Warehouse retrieved successfully",
        data: result,
    });
});

const updateWarehouse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const result = await WarehouseServices.updateWarehouse(id, updatedData);
    sendResponse(res, {
        statusCode: 200,
        message: "Warehouse updated successfully",
        data: result,
    });
});

const deleteWarehouse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WarehouseServices.deleteWarehouse(id);
    sendResponse(res, {
        statusCode: 200,
        message: "Warehouse deleted successfully",
        data: result,
    });
});

export const WarehouseControllers = {
    createWarehouse,
    getAllWarehouses,
    getWarehouseById,
    updateWarehouse,
    deleteWarehouse,
};
