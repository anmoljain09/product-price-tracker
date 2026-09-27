import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";

const app = express();

// Allow all origins
app.use(cors());

app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

export default app;