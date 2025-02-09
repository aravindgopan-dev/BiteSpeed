import { Router } from "express";
import identifyController from "../controller/identifyController"

const router = Router(); 

router.post("/identify", identifyController); 

export default router;
