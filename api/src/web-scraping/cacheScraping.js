import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ========================================
// ES MODULE PATH SETUP
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, "productCache.json");

// ========================================
// CONFIG
// ========================================

const API_URL =
  "https://demo.inelabteamdev.com/api/v2/listings";

const PER_PAGE = 20;

const REQUEST_DELAY = 1000;

const MAX_RETRIES = 5;

const RETRY_DELAY = 3000;

const FINAL_RETRIES = 8;


// ========================================
// CACHE
// ========================================

const cache = [];


// ========================================
// SLEEP
// ========================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// ========================================
// FETCH PAGE
// ========================================

async function fetchPage(page, retries = MAX_RETRIES) {

  for (let attempt = 1; attempt <= retries; attempt++) {

    try {

      const url =
        `${API_URL}?page=${page}&limit=${PER_PAGE}`;

      const response = await fetch(url);

      // -------------------------------
      // SUCCESS
      // -------------------------------

      if (response.ok) {

        const data = await response.json();

        if (!Array.isArray(data.results)) {
          throw new Error(
            "Invalid response: results is not an array"
          );
        }

        return data;
      }

      // -------------------------------
      // RETRYABLE ERRORS
      // -------------------------------

      if (
        response.status === 503 ||
        response.status === 429
      ) {

        if (attempt < retries) {

          const delay = RETRY_DELAY * attempt;

          console.log(
            `⚠️ Page ${page}: HTTP ${response.status} | ` +
            `Retry ${attempt}/${retries - 1} | ` +
            `waiting ${delay}ms`
          );

          await sleep(delay);

          continue;
        }

        throw new Error(
          `API failed: ${response.status}`
        );
      }

      // -------------------------------
      // OTHER API ERROR
      // -------------------------------

      throw new Error(
        `API failed: ${response.status}`
      );

    } catch (error) {

      if (attempt === retries) {
        throw error;
      }

      const delay = RETRY_DELAY * attempt;

      console.log(
        `⚠️ Page ${page}: ${error.message} | ` +
        `Retry ${attempt}/${retries - 1}`
      );

      await sleep(delay);
    }
  }

  throw new Error(
    `Page ${page} failed after retries`
  );
}


// ========================================
// VALIDATE PAGE
// ========================================

function validatePage(data, page, totalPages) {

  const problems = [];

  // --------------------------------------
  // results array check
  // --------------------------------------

  if (!Array.isArray(data.results)) {

    problems.push(
      "results is not an array"
    );

    return {
      valid: false,
      problems,
      invalidProducts: [],
      productCount: 0
    };
  }


  const products = data.results;


  // --------------------------------------
  // EMPTY PAGE
  // --------------------------------------

  if (products.length === 0) {

    problems.push(
      "Page returned 0 products"
    );
  }


  // --------------------------------------
  // PRODUCT COUNT
  // --------------------------------------

  const isLastPage = page === totalPages;

  if (
    !isLastPage &&
    products.length !== PER_PAGE
  ) {

    problems.push(
      `Expected ${PER_PAGE} products, got ${products.length}`
    );
  }


  // --------------------------------------
  // PRODUCT VALIDATION
  // --------------------------------------

  const invalidProducts = [];

  products.forEach((product, index) => {

    const errors = [];

    if (
      product.id === undefined ||
      product.id === null
    ) {
      errors.push("missing id");
    }

    if (
      !product.name ||
      typeof product.name !== "string"
    ) {
      errors.push("missing name");
    }

    if (
      !product.slug ||
      typeof product.slug !== "string"
    ) {
      errors.push("missing slug");
    }

    if (errors.length > 0) {

      invalidProducts.push({
        index: index + 1,
        id: product.id ?? null,
        name: product.name ?? null,
        errors
      });
    }
  });


  // --------------------------------------
  // ADD INVALID PRODUCT PROBLEM
  // --------------------------------------

  if (invalidProducts.length > 0) {

    problems.push(
      `${invalidProducts.length} invalid product(s)`
    );
  }


  return {
    valid: problems.length === 0,
    problems,
    invalidProducts,
    productCount: products.length
  };
}


// ========================================
// SAVE CACHE
// ========================================

function saveCache(products) {

  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify(products, null, 2),
    "utf-8"
  );
}


// ========================================
// MAIN
// ========================================

async function main() {

  console.log(
    "========================================"
  );

  console.log(
    "       STARTING PRODUCT CACHE"
  );

  console.log(
    "========================================\n"
  );


  let allProducts = [];

  let failedPages = [];

  let validationIssues = [];

  let successfulPages = 0;

  let invalidProductCount = 0;

  let emptyPages = 0;

  let wrongCountPages = 0;


  // ======================================
  // FIRST PAGE
  // ======================================

  let firstPage;

  try {

    firstPage = await fetchPage(1);

  } catch (error) {

    console.error(
      "❌ Could not fetch first page:"
    );

    console.error(error.message);

    process.exit(1);
  }


  const totalProducts = firstPage.count;

  const totalPages = firstPage.totalPages;


  console.log(
    `Total products: ${totalProducts}`
  );

  console.log(
    `Total pages: ${totalPages}\n`
  );


  // ======================================
  // PROCESS PAGE FUNCTION
  // ======================================

  function processPage(data, page) {

    const validation =
      validatePage(
        data,
        page,
        totalPages
      );


    // Add products
    allProducts.push(
      ...data.results
    );


    // -------------------------------
    // SUCCESS
    // -------------------------------

    if (validation.valid) {

      successfulPages++;

      console.log(
        `Page ${page}/${totalPages} ✓ ` +
        `| Products: ${validation.productCount}`
      );

      return;
    }


    // -------------------------------
    // VALIDATION PROBLEM
    // -------------------------------

    console.log(
      `⚠️ Page ${page}/${totalPages} ` +
      `| Products: ${validation.productCount}`
    );


    validation.problems.forEach(
      (problem) => {
        console.log(
          `   → ${problem}`
        );
      }
    );


    // Empty page
    if (
      validation.productCount === 0
    ) {
      emptyPages++;
    }


    // Wrong count
    if (
      validation.problems.some(
        (p) =>
          p.includes("Expected")
      )
    ) {
      wrongCountPages++;
    }


    // Invalid products
    if (
      validation.invalidProducts.length > 0
    ) {

      invalidProductCount +=
        validation.invalidProducts.length;


      validation.invalidProducts.forEach(
        (product) => {

          console.log(
            `   ❌ Product #${product.index}: ` +
            `${product.name || "UNKNOWN"}`
          );

          console.log(
            `      Problems: ${product.errors.join(", ")}`
          );
        }
      );
    }


    validationIssues.push({
      page,
      problems: validation.problems,
      invalidProducts:
        validation.invalidProducts
    });
  }


  // ======================================
  // PAGE 1
  // ======================================

  processPage(firstPage, 1);

  await sleep(REQUEST_DELAY);


  // ======================================
  // PAGES 2 - TOTAL PAGES
  // ======================================

  for (
    let page = 2;
    page <= totalPages;
    page++
  ) {

    try {

      const data =
        await fetchPage(page);

      processPage(data, page);

    } catch (error) {

      console.log(
        `❌ Page ${page}/${totalPages} FAILED: ` +
        `${error.message}`
      );

      failedPages.push(page);
    }


    await sleep(REQUEST_DELAY);
  }


  // ======================================
  // RETRY FAILED PAGES
  // ======================================

  if (failedPages.length > 0) {

    console.log(
      "\n========================================"
    );

    console.log(
      "        RETRYING FAILED PAGES"
    );

    console.log(
      "========================================\n"
    );


    const pagesToRetry = [
      ...failedPages
    ];

    failedPages = [];


    for (
      const page of pagesToRetry
    ) {

      try {

        await sleep(5000);

        const data =
          await fetchPage(
            page,
            FINAL_RETRIES
          );


        processPage(data, page);


        console.log(
          `   ✓ Page ${page} recovered`
        );

      } catch (error) {

        console.log(
          `❌ Page ${page} FAILED AGAIN: ` +
          `${error.message}`
        );

        failedPages.push(page);
      }


      await sleep(2000);
    }
  }


  // ======================================
  // DUPLICATE REMOVAL
  // ======================================

  const uniqueProductsMap =
    new Map();


  for (
    const product of allProducts
  ) {

    if (
      product.id !== undefined &&
      product.id !== null
    ) {

      uniqueProductsMap.set(
        product.id,
        product
      );

    } else {

      const fallbackKey =
        `${product.name}-${product.slug}`;

      uniqueProductsMap.set(
        fallbackKey,
        product
      );
    }
  }


  const uniqueProducts =
    Array.from(
      uniqueProductsMap.values()
    );


  // ======================================
  // CONVERT TO CACHE FORMAT
  // ======================================

  const cacheProducts =
    uniqueProducts.map((product) => ({
      id: String(product.id),
      name: product.name,
      url:
        product.url ||
        `https://demo.inelabteamdev.com/item/${product.id}`,
    }));


  // ======================================
  // STORE IN MEMORY CACHE
  // ======================================

  cache.length = 0;
  cache.push(...cacheProducts);



  // ======================================
  // SAVE CACHE FILE
  // ======================================

  saveCache(cache);


  // ======================================
  // FINAL REPORT
  // ======================================

  console.log(
    "\n========================================"
  );

  console.log(
    "             FINAL REPORT"
  );

  console.log(
    "========================================"
  );


  console.log(
    `Expected products: ${totalProducts}`
  );

  console.log(
    `Products fetched: ${allProducts.length}`
  );

  console.log(
    `Unique products: ${uniqueProducts.length}`
  );

  console.log(
    `Pages successful: ${successfulPages}/${totalPages}`
  );

  console.log(
    `Pages failed: ${failedPages.length}`
  );

  console.log(
    `Invalid products: ${invalidProductCount}`
  );

  console.log(
    `Empty pages: ${emptyPages}`
  );

  console.log(
    `Wrong-count pages: ${wrongCountPages}`
  );


  // ======================================
  // FAILED PAGE DETAILS
  // ======================================

  if (failedPages.length > 0) {

    console.log(
      "\n❌ FAILED PAGES:"
    );

    failedPages.forEach(
      (page) => {
        console.log(
          `   Page ${page}`
        );
      }
    );
  }


  // ======================================
  // VALIDATION DETAILS
  // ======================================

  if (
    validationIssues.length > 0
  ) {

    console.log(
      "\n⚠️ VALIDATION ISSUES:"
    );


    validationIssues.forEach(
      (issue) => {

        console.log(
          `\nPage ${issue.page}:`
        );

        issue.problems.forEach(
          (problem) => {

            console.log(
              `   → ${problem}`
            );
          }
        );
      }
    );

  } else {

    console.log(
      "\n✅ All pages passed validation."
    );
  }


  // ======================================
  // CACHE LOCATION
  // ======================================

  console.log(
    `\nSaved to: ${CACHE_FILE}`
  );

  console.log(
    `✅ Cache loaded in memory and saved to productCache.json`
  );


  console.log(
    "========================================\n"
  );
}


export { cache, main };