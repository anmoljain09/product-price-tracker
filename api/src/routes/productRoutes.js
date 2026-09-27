import express from "express";
import { addProduct, sendCache , refreshCache , sendTracklistCart , trackProduct , sendDetailData } from "../controllers/productController.js";

const router = express.Router();

router.post("/add", addProduct);
router.get("/cache", sendCache);
router.post("/cache/refresh", refreshCache); 
router.get("/tracklistcart", sendTracklistCart);
router.post("/trackableurl", trackProduct);
router.get("/detaildata", sendDetailData);


export default router;