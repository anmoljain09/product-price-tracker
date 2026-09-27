// this is a legacy file now , as new refresh product cache button is added

import { main } from "../web-scraping/cacheScraping.js";

main().catch((error) => {
  console.error("\n❌ CACHE SCRIPT FAILED");
  console.error(error);
  process.exit(1);
});
