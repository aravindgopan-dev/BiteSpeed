import { Router } from "express";
import { getidentity,controller } from "../controller/identifyController";
const router = Router(); 

router.post("/identify", controller); 
router.get("/identify",getidentity)

export default router;
