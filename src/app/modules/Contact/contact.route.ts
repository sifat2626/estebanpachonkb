import express from "express";
import auth from "../../middlewares/auth";
import {ContactController} from "./contact.controller";

const router = express.Router();

router.post("/",auth('USER'),ContactController.contact)



export const ContactRoutes = router;