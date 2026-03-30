import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import offersRouter from "./offers";
import ordersRouter from "./orders";
import customersRouter from "./customers";
import adminRouter from "./admin";
import siteSettingsRouter from "./site-settings";
import messagesRouter from "./messages";
import aiProductsRouter from "./ai-products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(offersRouter);
router.use(ordersRouter);
router.use(customersRouter);
router.use(adminRouter);
router.use(siteSettingsRouter);
router.use(messagesRouter);
router.use(aiProductsRouter);

export default router;
