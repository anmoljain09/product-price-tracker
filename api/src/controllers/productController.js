import Product from "../models/ProductModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { main } from "../web-scraping/cacheScraping.js";
import { scrapeProductDetails } from "../web-scraping/detailScraping.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(
  __dirname,
  "../web-scraping/productCache.json"
);

const DETAIL_FILE = path.join(
  __dirname,
  "../web-scraping/detail.json"
);



export const addProduct = async (req, res) => {
  try {
    const { id, name, url } = req.body;

    if (!id || !name || !url) {
      return res.status(400).json({
        success: false,
        message: "id, name and url are required",
      });
    }

    const existingProduct = await Product.findOne({ id });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product already exists",
      });
    }

    const product = await Product.create({
      id,
      name,
      url,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const sendCache = (req, res) => {
//   res.status(200).json({
//     success: true,
//     products: cache,
//   });
// };

export const sendCache = (req, res) => {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return res.status(404).json({
        success: false,
        message: "Product cache not found",
        products: [],
      });
    }

    const cacheData = fs.readFileSync(
      CACHE_FILE,
      "utf-8"
    );

    const products = JSON.parse(cacheData);

    return res.status(200).json({
      success: true,
      products,
    });

  } catch (error) {
    console.error("Failed to read product cache:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load product cache",
      products: [],
    });
  }
};


export const refreshCache = async (req, res) => {
  try {
    console.log("🔄 Cache refresh requested...");

    await main();

    const products = JSON.parse(
      fs.readFileSync(CACHE_FILE, "utf-8")
    );

    return res.status(200).json({
      success: true,
      message: "Product cache refreshed successfully",
      products,
    });

  } catch (error) {
    console.error("❌ Cache refresh failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to refresh product cache",
      error: error.message,
    });
  }
};


export const sendTracklistCart = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Failed to fetch tasklist:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasklist",
      products: [],
    });
  }
};


export const trackProduct = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Product URL is required",
      });
    }

    console.log("🔍 Tracking product:", url);

    // Scrape current product data
    const scrapedData = await scrapeProductDetails(url);

    // Existing detail.json data
    let existingData = [];

    if (fs.existsSync(DETAIL_FILE)) {
      const fileData = fs.readFileSync(
        DETAIL_FILE,
        "utf-8"
      );

      if (fileData.trim()) {
        existingData = JSON.parse(fileData);
      }
    }

    // Make sure it is an array
    if (!Array.isArray(existingData)) {
      existingData = [];
    }

    // Add new scrape result
    existingData.push(scrapedData);

    // Save without overwriting old data
    fs.writeFileSync(
      DETAIL_FILE,
      JSON.stringify(existingData, null, 2),
      "utf-8"
    );

    return res.status(200).json({
      success: true,
      message: "Product tracked successfully",
      data: scrapedData,
    });

  } catch (error) {
    console.error(
      "❌ Product tracking failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to track product",
      error: error.message,
    });
  }
};


export const sendDetailData = (req, res) => {
  try {
    if (!fs.existsSync(DETAIL_FILE)) {
      return res.status(404).json({
        success: false,
        message: "Detail file not found",
        data: [],
      });
    }

    const fileData = fs.readFileSync(
      DETAIL_FILE,
      "utf-8"
    );

    const data = fileData.trim()
      ? JSON.parse(fileData)
      : [];

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Failed to read detail data:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load detail data",
      data: [],
    });
  }
};
