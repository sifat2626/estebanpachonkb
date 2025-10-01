import express from 'express';
import { AuthRouters } from '../modules/Auth/auth.routes';
import { UserRouters } from '../modules/User/user.routes';
import { PreAlertRouters } from '../modules/PreAlert/PreAlert.route';
import PackageRoute from '../modules/Package/package.route';
import PaymentRoute from '../modules/Payment/payment.route';
import PricingRoute from '../modules/PricingPlan/pricing.route';
import { ServiceRoute } from '../modules/Service/Service.route';
import { BlogRoute } from '../modules/Blog/Blog.route';
import { orderRoute } from '../modules/Order/Order.route';
import { consolidationRoute } from '../modules/Consolidation/Consolidation.route';
import { WarehouseRoutes } from '../modules/Warehouse/warehouse.route';
import { AgentRoutes } from '../modules/Agent/agent.route';
import { ReviewRoutes } from '../modules/Review/review.route';
import { DashboardRoutes } from '../modules/Dashboard/dashboard.route';
import { ContactRoutes } from '../modules/Contact/contact.route';
import { EarnRoutes } from '../modules/Earn/earn.route';
import { CalculatorRoutes } from '../modules/Calculator/calculator.route';
import { FAQRoutes } from '../modules/Faq/faq.route';
import { PartnerRoutes } from '../modules/Partner/partner.route';
import { CompanyRoutes } from '../modules/Company/company.route';
import { AboutUsRoutes } from '../modules/About/about.route';
import { FulfillmentRoutes } from '../modules/Fulfillment/fulfillment.route';
import { BannerRoutes } from '../modules/Banner/banner.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/Auth',
    route: AuthRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/alerts',
    route: PreAlertRouters,
  },
  {
    path: '/packages',
    route: PackageRoute,
  },
  {
    path: '/payments',
    route: PaymentRoute,
  },
  {
    path: '/pricing',
    route: PricingRoute,
  },
  {
    path: '/service',
    route: ServiceRoute,
  },
  {
    path: '/blog',
    route: BlogRoute,
  },
  {
    path: '/order',
    route: orderRoute,
  },
  {
    path: '/consolidation',
    route: consolidationRoute,
  },
  {
    path: '/warehouses',
    route: WarehouseRoutes,
  },
  {
    path: '/agents',
    route: AgentRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path: '/earn',
    route: EarnRoutes,
  },
  {
    path: '/calculate',
    route: CalculatorRoutes,
  },
  {
    path: '/faq',
    route: FAQRoutes,
  },
  {
    path: '/partners',
    route: PartnerRoutes,
  },
  {
    path: '/company',
    route: CompanyRoutes,
  },
  {
    path: '/about',
    route: AboutUsRoutes,
  },
  {
    path: '/fulfilment',
    route: FulfillmentRoutes,
  },

  {
    path: '/banner',
    route: BannerRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
