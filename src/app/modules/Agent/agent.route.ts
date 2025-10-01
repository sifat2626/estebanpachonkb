import express from "express";
import auth from "../../middlewares/auth";
import { AgentControllers } from "./agent.controller";

const router = express.Router();

router.post("/", auth("ADMIN", "SUPERADMIN"), AgentControllers.createAgent);
router.get("/", auth("ADMIN", "SUPERADMIN"), AgentControllers.getAllAgents);
router.get("/:id", auth("ADMIN", "SUPERADMIN"), AgentControllers.getAgentById);

router.get('/orders/:status',auth('SUPERADMIN','ADMIN','AGENT'),AgentControllers.ordersByAgent)
router.put('/update-status',auth('AGENT'),AgentControllers.updateOrderByAgent);

router.put("/:id", auth("ADMIN", "SUPERADMIN"), AgentControllers.updateAgent);
router.delete("/:id", auth("ADMIN", "SUPERADMIN"), AgentControllers.deleteAgent);

export const AgentRoutes = router;
