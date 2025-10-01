import { Router } from 'express';
import auth from '../../middlewares/auth';
import { orderController } from './Order.controller';
import { UserRoleEnum } from '@prisma/client';

const router = Router();

// Review order before creation
router.post(
  '/review',
  auth(UserRoleEnum.USER, UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  orderController.reviewOrder,
);

router.get(
  '/summary',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  orderController.getOrderSummary,
);

// Create a new order
router.post(
  '/',
  auth(UserRoleEnum.USER),
  orderController.createOrder,
);

// Get all orders (Admin & Superadmin only)
router.get(
  '/',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  orderController.getAllOrders,
);

router.get(
  '/user',
  auth(UserRoleEnum.USER),
  orderController.getUserOrders,
);

router.get('/history/:id',auth(UserRoleEnum.USER,UserRoleEnum.ADMIN,UserRoleEnum.SUPERADMIN),orderController.getOrderHistory)

// Get a single order by ID (User can only access their orders)
router.get(
  '/:id',
  auth(UserRoleEnum.USER, UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  orderController.getOrderById,
);


// Update order details (Admins & Users can modify orders)
router.put(
  '/:id',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  orderController.updateOrder,
);

// Update order status (Admin & Superadmin only)
router.patch(
  '/:id/status',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN),
  orderController.updateOrderStatus,
);

// Cancel an order (Users can cancel their own orders)
router.delete('/:id', auth(UserRoleEnum.USER), orderController.cancelOrder);


export const orderRoute = router;
