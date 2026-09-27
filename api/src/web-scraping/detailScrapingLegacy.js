
// import { chromium } from "playwright";

// /* ============================================================
//    DETAIL SCRAPING - HEAVY DEBUG VERSION
//    ------------------------------------------------------------
//    Purpose:
//    - Scraping logic ko diagnose karna
//    - Har important DOM/state change console me dikhana
//    - Consent overlay
//    - disabled button
//    - hover behavior
//    - click behavior
//    - React DOM mutations
//    - network requests
//    - browser console errors
//    - page errors
//    - screenshots / HTML snapshots on failure
//    ============================================================ */

// const DEBUG = true;

// const log = (...args) => {
//   if (DEBUG) console.log("[scraper]", ...args);
// };

// const warn = (...args) => {
//   console.warn("[scraper][WARN]", ...args);
// };

// const err = (...args) => {
//   console.error("[scraper][ERROR]", ...args);
// };

// const line = () => {
//   console.log("\n" + "=".repeat(70));
// };

// const subLine = () => {
//   console.log("-".repeat(70));
// };

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// /* ============================================================
//    SAFE JSON
//    ============================================================ */

// function safeJson(value) {
//   try {
//     return JSON.stringify(value, null, 2);
//   } catch {
//     return String(value);
//   }
// }

// /* ============================================================
//    DEBUG: PAGE CONSOLE
//    ============================================================ */

// function attachPageDebug(page) {
//   page.on("console", async (message) => {
//     try {
//       const type = message.type();
//       const text = message.text();

//       console.log(
//         `[browser-console][${type}] ${text}`
//       );
//     } catch (e) {
//       console.log("[browser-console] <unable to read>", e.message);
//     }
//   });

//   page.on("pageerror", (error) => {
//     err("BROWSER PAGE ERROR:", error?.stack || error?.message || error);
//   });

//   page.on("requestfailed", (request) => {
//     console.log(
//       `[network][FAILED] ${request.method()} ${request.url()}`
//     );

//     console.log(
//       `[network][FAILED] error=${request.failure()?.errorText || "unknown"}`
//     );
//   });

//   page.on("request", (request) => {
//     const url = request.url();

//     // Only print potentially useful requests.
//     if (
//       /price|offer|product|availability|stock|inventory|api|graphql/i.test(
//         url
//       )
//     ) {
//       console.log(
//         `[network][REQUEST] ${request.method()} ${url}`
//       );

//       const postData = request.postData();

//       if (postData) {
//         console.log(
//           "[network][POST DATA]",
//           postData.slice(0, 3000)
//         );
//       }
//     }
//   });

//   page.on("response", async (response) => {
//     const url = response.url();

//     if (
//       /price|offer|product|availability|stock|inventory|api|graphql/i.test(
//         url
//       )
//     ) {
//       console.log(
//         `[network][RESPONSE] ${response.status()} ${response.request().method()} ${url}`
//       );

//       try {
//         const contentType =
//           response.headers()["content-type"] || "";

//         if (
//           contentType.includes("application/json") ||
//           contentType.includes("text/plain")
//         ) {
//           const body = await response.text();

//           console.log(
//             "[network][RESPONSE BODY]",
//             body.slice(0, 5000)
//           );
//         }
//       } catch (e) {
//         console.log(
//           "[network][RESPONSE BODY] unable to read:",
//           e.message
//         );
//       }
//     }
//   });

//   page.on("requestfinished", (request) => {
//     const url = request.url();

//     if (
//       /price|offer|availability|stock|inventory|api|graphql/i.test(
//         url
//       )
//     ) {
//       console.log(
//         `[network][FINISHED] ${request.method()} ${url}`
//       );
//     }
//   });
// }

// /* ============================================================
//    DEBUG: FULL PAGE STATE
//    ============================================================ */

// async function dumpPageState(page, label = "") {
//   line();

//   console.log(
//     `[DEBUG SNAPSHOT] ${label || "page state"}`
//   );

//   try {
//     const state = await page.evaluate(() => {
//       const body = document.body;

//       const offerPanels = [
//         ...document.querySelectorAll(
//           ".offer-panel"
//         ),
//       ].map((el) => ({
//         tag: el.tagName,
//         className: el.className,
//         text: el.innerText,
//         outerHTML: el.outerHTML.slice(0, 12000),
//       }));

//       const buttons = [
//         ...document.querySelectorAll("button"),
//       ].map((button, index) => ({
//         index,
//         text: button.innerText,
//         ariaLabel: button.getAttribute("aria-label"),
//         disabled: button.disabled,
//         hasDisabledAttr: button.hasAttribute("disabled"),
//         className: button.className,
//         ariaPressed: button.getAttribute("aria-pressed"),
//         rect: (() => {
//           const r = button.getBoundingClientRect();

//           return {
//             x: r.x,
//             y: r.y,
//             width: r.width,
//             height: r.height,
//           };
//         })(),
//       }));

//       const overlays = [
//         ...document.querySelectorAll(
//           [
//             ".consent-scrim",
//             ".consent-overlay",
//             "[role='dialog']",
//             "[aria-modal='true']",
//             ".modal",
//             ".overlay",
//             "[class*='consent']",
//             "[class*='overlay']",
//             "[class*='scrim']",
//           ].join(",")
//         ),
//       ].map((el) => {
//         const style = getComputedStyle(el);
//         const rect = el.getBoundingClientRect();

//         return {
//           tag: el.tagName,
//           className: el.className,
//           text: el.innerText?.slice(0, 2000),
//           display: style.display,
//           visibility: style.visibility,
//           opacity: style.opacity,
//           pointerEvents: style.pointerEvents,
//           zIndex: style.zIndex,
//           rect: {
//             x: rect.x,
//             y: rect.y,
//             width: rect.width,
//             height: rect.height,
//           },
//           outerHTML: el.outerHTML.slice(0, 6000),
//         };
//       });

//       const priceCandidates = [
//         ...document.querySelectorAll(
//           [
//             "[data-price]",
//             ".price-value",
//             ".amount",
//             "[class*='price']",
//             "[class*='amount']",
//             "[class*='offer']",
//           ].join(",")
//         ),
//       ].map((el) => ({
//         tag: el.tagName,
//         className: el.className,
//         text: el.innerText,
//         ariaHidden: el.getAttribute("aria-hidden"),
//         dataPrice: el.getAttribute("data-price"),
//         display: getComputedStyle(el).display,
//         visibility: getComputedStyle(el).visibility,
//         opacity: getComputedStyle(el).opacity,
//         textContent: el.textContent,
//       }));

//       return {
//         url: location.href,
//         title: document.title,
//         readyState: document.readyState,

//         bodyTextLength:
//           body?.innerText?.length || 0,

//         bodyText:
//           body?.innerText?.slice(0, 15000) || "",

//         htmlLength:
//           document.documentElement.outerHTML.length,

//         offerPanels,

//         buttons,

//         overlays,

//         priceCandidates,

//         activeElement: {
//           tag: document.activeElement?.tagName,
//           id: document.activeElement?.id,
//           className:
//             document.activeElement?.className,
//           text:
//             document.activeElement?.innerText?.slice(0, 500),
//         },
//       };
//     });

//     console.log(
//       safeJson(state)
//     );
//   } catch (e) {
//     err(
//       "dumpPageState failed:",
//       e?.stack || e?.message || e
//     );
//   }

//   subLine();
// }

// /* ============================================================
//    DEBUG: OFFER PANEL
//    ============================================================ */

// async function dumpOffer(page, label = "") {
//   console.log(
//     `\n[OFFER DEBUG] ${label}`
//   );

//   try {
//     const data = await page.evaluate(() => {
//       const panels = [
//         ...document.querySelectorAll(".offer-panel"),
//       ];

//       return panels.map((panel, index) => {
//         const button =
//           panel.querySelector("button");

//         const rect =
//           panel.getBoundingClientRect();

//         return {
//           index,

//           panelClass:
//             panel.className,

//           panelText:
//             panel.innerText,

//           panelHTML:
//             panel.outerHTML.slice(0, 15000),

//           button: button
//             ? {
//                 text: button.innerText,
//                 ariaLabel:
//                   button.getAttribute("aria-label"),
//                 disabled: button.disabled,
//                 disabledAttribute:
//                   button.getAttribute("disabled"),
//                 className:
//                   button.className,
//                 type:
//                   button.getAttribute("type"),
//                 rect: (() => {
//                   const r =
//                     button.getBoundingClientRect();

//                   return {
//                     x: r.x,
//                     y: r.y,
//                     width: r.width,
//                     height: r.height,
//                   };
//                 })(),
//               }
//             : null,

//           computedStyle: {
//             display:
//               getComputedStyle(panel).display,
//             visibility:
//               getComputedStyle(panel).visibility,
//             opacity:
//               getComputedStyle(panel).opacity,
//             pointerEvents:
//               getComputedStyle(panel).pointerEvents,
//             zIndex:
//               getComputedStyle(panel).zIndex,
//           },

//           rect: {
//             x: rect.x,
//             y: rect.y,
//             width: rect.width,
//             height: rect.height,
//           },
//         };
//       });
//     });

//     console.log(safeJson(data));
//   } catch (e) {
//     err(
//       "dumpOffer failed:",
//       e?.stack || e?.message || e
//     );
//   }
// }

// /* ============================================================
//    DEBUG: BUTTON
//    ============================================================ */

// async function inspectPriceButton(page) {
//   console.log(
//     "\n[BUTTON DEBUG] Inspecting price button..."
//   );

//   const selector =
//     'button[aria-label="Check today’s price"], button[aria-label="Check today\'s price"]';

//   const count = await page.locator(selector).count();

//   console.log(
//     `[BUTTON DEBUG] Matching buttons: ${count}`
//   );

//   if (!count) {
//     warn("Price button not found.");

//     return null;
//   }

//   const button =
//     page.locator(selector).first();

//   const data =
//     await button.evaluate((el) => {
//       const rect =
//         el.getBoundingClientRect();

//       const style =
//         getComputedStyle(el);

//       const parent =
//         el.parentElement;

//       const parentStyle =
//         parent
//           ? getComputedStyle(parent)
//           : null;

//       return {
//         outerHTML:
//           el.outerHTML,

//         text:
//           el.innerText,

//         textContent:
//           el.textContent,

//         disabled:
//           el.disabled,

//         hasDisabled:
//           el.hasAttribute("disabled"),

//         ariaLabel:
//           el.getAttribute("aria-label"),

//         className:
//           el.className,

//         type:
//           el.getAttribute("type"),

//         tabIndex:
//           el.tabIndex,

//         rect: {
//           x: rect.x,
//           y: rect.y,
//           width: rect.width,
//           height: rect.height,
//           top: rect.top,
//           left: rect.left,
//           right: rect.right,
//           bottom: rect.bottom,
//         },

//         style: {
//           display: style.display,
//           visibility: style.visibility,
//           opacity: style.opacity,
//           pointerEvents: style.pointerEvents,
//           position: style.position,
//           zIndex: style.zIndex,
//           cursor: style.cursor,
//         },

//         parent: parent
//           ? {
//               tag: parent.tagName,
//               className: parent.className,
//               text:
//                 parent.innerText?.slice(0, 2000),
//               outerHTML:
//                 parent.outerHTML.slice(0, 10000),

//               style: parentStyle
//                 ? {
//                     display:
//                       parentStyle.display,
//                     visibility:
//                       parentStyle.visibility,
//                     pointerEvents:
//                       parentStyle.pointerEvents,
//                     position:
//                       parentStyle.position,
//                     zIndex:
//                       parentStyle.zIndex,
//                   }
//                 : null,
//             }
//           : null,
//       };
//     });

//   console.log(
//     safeJson(data)
//   );

//   return data;
// }

// /* ============================================================
//    DEBUG: HIT TEST
//    ============================================================ */

// async function inspectHitTest(page) {
//   console.log(
//     "\n[HIT TEST] Checking what is actually above the price button..."
//   );

//   try {
//     const result = await page.evaluate(() => {
//       const button =
//         document.querySelector(
//           'button[aria-label="Check today’s price"], button[aria-label="Check today\'s price"]'
//         );

//       if (!button) {
//         return {
//           found: false,
//         };
//       }

//       const rect =
//         button.getBoundingClientRect();

//       const points = [
//         {
//           name: "center",
//           x: rect.left + rect.width / 2,
//           y: rect.top + rect.height / 2,
//         },

//         {
//           name: "top-left-ish",
//           x: rect.left + Math.min(10, rect.width / 2),
//           y: rect.top + Math.min(10, rect.height / 2),
//         },

//         {
//           name: "bottom-right-ish",
//           x: rect.right - Math.min(10, rect.width / 2),
//           y: rect.bottom - Math.min(10, rect.height / 2),
//         },
//       ];

//       return {
//         button: {
//           disabled: button.disabled,
//           rect: {
//             x: rect.x,
//             y: rect.y,
//             width: rect.width,
//             height: rect.height,
//           },
//         },

//         points: points.map((point) => {
//           const elements =
//             document.elementsFromPoint(
//               point.x,
//               point.y
//             );

//           return {
//             ...point,

//             topElement:
//               elements[0]
//                 ? {
//                     tag:
//                       elements[0].tagName,
//                     id:
//                       elements[0].id,
//                     className:
//                       elements[0].className,
//                     text:
//                       elements[0].innerText?.slice(
//                         0,
//                         500
//                       ),
//                     outerHTML:
//                       elements[0].outerHTML.slice(
//                         0,
//                         3000
//                       ),
//                   }
//                 : null,

//             stack: elements
//               .slice(0, 10)
//               .map((el) => ({
//                 tag: el.tagName,
//                 id: el.id,
//                 className: el.className,
//                 text:
//                   el.innerText?.slice(0, 300),
//               })),
//           };
//         }),
//       };
//     });

//     console.log(
//       safeJson(result)
//     );
//   } catch (e) {
//     err(
//       "Hit test failed:",
//       e?.stack || e?.message || e
//     );
//   }
// }

// /* ============================================================
//    DEBUG: CONSENT
//    ============================================================ */

// async function inspectConsent(page) {
//   console.log(
//     "\n[CONSENT DEBUG] Searching consent elements..."
//   );

//   const result = await page.evaluate(() => {
//     const selectors = [
//       ".consent-scrim",
//       ".consent-overlay",
//       "[role='dialog']",
//       "[aria-modal='true']",
//       "button",
//       "[class*='consent']",
//       "[class*='scrim']",
//       "[class*='overlay']",
//     ];

//     const elements = [];

//     for (const selector of selectors) {
//       for (const el of document.querySelectorAll(
//         selector
//       )) {
//         if (elements.includes(el)) continue;

//         const style =
//           getComputedStyle(el);

//         const rect =
//           el.getBoundingClientRect();

//         elements.push({
//           selector,
//           tag: el.tagName,
//           className: el.className,
//           text:
//             el.innerText?.slice(0, 2000),
//           display: style.display,
//           visibility: style.visibility,
//           opacity: style.opacity,
//           pointerEvents:
//             style.pointerEvents,
//           zIndex: style.zIndex,
//           rect: {
//             x: rect.x,
//             y: rect.y,
//             width: rect.width,
//             height: rect.height,
//           },
//           outerHTML:
//             el.outerHTML.slice(0, 6000),
//         });
//       }
//     }

//     return elements;
//   });

//   console.log(
//     safeJson(result)
//   );

//   return result;
// }

// /* ============================================================
//    CONSENT HANDLER
//    ============================================================ */

// async function handleConsent(page) {
//   console.log(
//     "\n[CONSENT] Checking for consent overlay..."
//   );

//   try {
//     const candidates = [
//       ".consent-scrim",
//       ".consent-overlay",
//       "[role='dialog']",
//       "[aria-modal='true']",
//     ];

//     let visibleOverlay = null;

//     for (const selector of candidates) {
//       const locator =
//         page.locator(selector);

//       const count =
//         await locator.count();

//       console.log(
//         `[CONSENT] ${selector}: ${count} element(s)`
//       );

//       for (let i = 0; i < count; i++) {
//         const el =
//           locator.nth(i);

//         if (await el.isVisible().catch(() => false)) {
//           visibleOverlay = el;
//           console.log(
//             `[CONSENT] Visible overlay found: ${selector} #${i}`
//           );
//           break;
//         }
//       }

//       if (visibleOverlay) break;
//     }

//     if (!visibleOverlay) {
//       console.log(
//         "[CONSENT] No visible consent overlay."
//       );

//       return false;
//     }

//     console.log(
//       "[CONSENT] Overlay text:"
//     );

//     console.log(
//       (await visibleOverlay.innerText().catch(() => ""))
//         .slice(0, 3000)
//     );

//     const buttons =
//       visibleOverlay.locator("button");

//     const count =
//       await buttons.count();

//     console.log(
//       `[CONSENT] Buttons inside overlay: ${count}`
//     );

//     for (let i = 0; i < count; i++) {
//       const b =
//         buttons.nth(i);

//       console.log(
//         `[CONSENT] button ${i}:`,
//         {
//           text:
//             await b.innerText().catch(() => ""),
//           aria:
//             await b
//               .getAttribute("aria-label")
//               .catch(() => null),
//           disabled:
//             await b.isDisabled().catch(() => false),
//         }
//       );
//     }

//     const allowSelectors = [
//       'button:has-text("Allow")',
//       'button:has-text("Accept")',
//       'button:has-text("Agree")',
//       'button:has-text("Continue")',
//       '[aria-label*="Allow"]',
//       '[aria-label*="Accept"]',
//     ];

//     for (const selector of allowSelectors) {
//       const btn =
//         page.locator(selector).first();

//       if (
//         await btn
//           .isVisible()
//           .catch(() => false)
//       ) {
//         console.log(
//           `[CONSENT] Clicking consent button: ${selector}`
//         );

//         await btn.click({
//           force: true,
//         });

//         await sleep(500);

//         console.log(
//           "[CONSENT] Consent click completed."
//         );

//         await inspectConsent(page);

//         return true;
//       }
//     }

//     warn(
//       "[CONSENT] Overlay exists but no Allow/Accept button was found."
//     );

//     return false;
//   } catch (e) {
//     err(
//       "[CONSENT] Failed:",
//       e?.stack || e?.message || e
//     );

//     return false;
//   }
// }

// /* ============================================================
//    DEBUG: OPTION STATE
//    ============================================================ */

// async function dumpOptions(page) {
//   console.log(
//     "\n[OPTIONS DEBUG]"
//   );

//   try {
//     const result =
//       await page.locator(
//         ".opt-picker"
//       ).evaluateAll((groups) =>
//         groups.map((group) => ({
//           ariaLabel:
//             group.getAttribute("aria-label"),

//           text:
//             group.innerText,

//           html:
//             group.outerHTML.slice(0, 10000),

//           buttons:
//             [...group.querySelectorAll("button")]
//               .map((button) => ({
//                 text: button.innerText,
//                 ariaPressed:
//                   button.getAttribute(
//                     "aria-pressed"
//                   ),
//                 disabled:
//                   button.disabled,
//                 className:
//                   button.className,
//               })),
//         }))
//       );

//     console.log(
//       safeJson(result)
//     );
//   } catch (e) {
//     err(
//       "Options debug failed:",
//       e?.message
//     );
//   }
// }

// /* ============================================================
//    DEBUG: MUTATION OBSERVER
//    ============================================================ */

// async function installMutationDebug(page) {
//   console.log(
//     "\n[MUTATION] Installing DOM MutationObserver..."
//   );

//   await page.evaluate(() => {
//     if (window.__scraperMutationObserverInstalled) {
//       console.log(
//         "[scraper-debug] MutationObserver already installed"
//       );

//       return;
//     }

//     window.__scraperMutationObserverInstalled = true;

//     const interesting = (node) => {
//       if (!node || node.nodeType !== 1) {
//         return false;
//       }

//       const el = node;

//       const text =
//         el.innerText || "";

//       const attrs =
//         [
//           el.id,
//           el.className,
//           el.getAttribute?.("aria-label"),
//         ]
//           .filter(Boolean)
//           .join(" ");

//       return (
//         /offer|price|consent|scrim|overlay|button|option/i.test(
//           attrs
//         ) ||
//         /price locked|check today|member price|saving/i.test(
//           text
//         )
//       );
//     };

//     const observer =
//       new MutationObserver((mutations) => {
//         for (const mutation of mutations) {
//           if (
//             mutation.type ===
//             "attributes"
//           ) {
//             const target =
//               mutation.target;

//             if (interesting(target)) {
//               console.log(
//                 "[scraper-debug][MUTATION][ATTRIBUTE]",
//                 {
//                   tag: target.tagName,
//                   className:
//                     target.className,
//                   attribute:
//                     mutation.attributeName,
//                   value:
//                     target.getAttribute(
//                       mutation.attributeName
//                     ),
//                   outerHTML:
//                     target.outerHTML.slice(
//                       0,
//                       5000
//                     ),
//                 }
//               );
//             }
//           }

//           if (
//             mutation.type ===
//             "childList"
//           ) {
//             const parent =
//               mutation.target;

//             if (interesting(parent)) {
//               console.log(
//                 "[scraper-debug][MUTATION][CHILD]",
//                 {
//                   parent:
//                     parent?.tagName,
//                   parentClass:
//                     parent?.className,
//                   added:
//                     mutation.addedNodes.length,
//                   removed:
//                     mutation.removedNodes.length,
//                   text:
//                     parent?.innerText?.slice(
//                       0,
//                       3000
//                     ),
//                 }
//               );
//             }
//           }

//           if (
//             mutation.type ===
//             "characterData"
//           ) {
//             console.log(
//               "[scraper-debug][MUTATION][TEXT]",
//               mutation.target?.textContent
//             );
//           }
//         }
//       });

//     observer.observe(
//       document.documentElement,
//       {
//         subtree: true,
//         childList: true,
//         attributes: true,
//         attributeOldValue: true,
//         characterData: true,
//       }
//     );

//     window.__scraperMutationObserver =
//       observer;

//     console.log(
//       "[scraper-debug] MutationObserver installed"
//     );
//   });
// }

// /* ============================================================
//    DEBUG: EVENT LISTENERS
//    ============================================================ */

// async function installEventDebug(page) {
//   console.log(
//     "\n[EVENT DEBUG] Installing click/mouse/pointer debug..."
//   );

//   await page.evaluate(() => {
//     if (window.__scraperEventDebugInstalled) {
//       return;
//     }

//     window.__scraperEventDebugInstalled = true;

//     const isInteresting = (el) => {
//       if (!el) return false;

//       const text =
//         el.innerText ||
//         el.textContent ||
//         "";

//       const attrs =
//         [
//           el.id,
//           el.className,
//           el.getAttribute?.("aria-label"),
//         ]
//           .filter(Boolean)
//           .join(" ");

//       return /price|offer|consent|scrim|overlay|button/i.test(
//         `${attrs} ${text}`
//       );
//     };

//     [
//       "pointerdown",
//       "pointerup",
//       "mousedown",
//       "mouseup",
//       "click",
//       "mouseover",
//       "mouseenter",
//       "mousemove",
//     ].forEach((eventName) => {
//       document.addEventListener(
//         eventName,
//         (event) => {
//           const target =
//             event.target;

//           if (!isInteresting(target)) {
//             return;
//           }

//           console.log(
//             `[scraper-debug][EVENT] ${eventName}`,
//             {
//               tag:
//                 target?.tagName,
//               id:
//                 target?.id,
//               className:
//                 target?.className,
//               text:
//                 target?.innerText?.slice(
//                   0,
//                   500
//                 ),
//               ariaLabel:
//                 target?.getAttribute?.(
//                   "aria-label"
//                 ),
//               disabled:
//                 target?.disabled,
//               defaultPrevented:
//                 event.defaultPrevented,
//               bubbles:
//                 event.bubbles,
//               clientX:
//                 event.clientX,
//               clientY:
//                 event.clientY,
//             }
//           );
//         },
//         true
//       );
//     });

//     console.log(
//       "[scraper-debug] Event debugging installed"
//     );
//   });
// }

// /* ============================================================
//    DEBUG: RELEVANT GLOBALS
//    ============================================================ */

// async function dumpRelevantGlobals(page) {
//   console.log(
//     "\n[GLOBALS DEBUG]"
//   );

//   try {
//     const globals =
//       await page.evaluate(() => {
//         return Object.keys(window)
//           .filter((key) =>
//             /price|offer|product|consent|inventory|stock/i.test(
//               key
//             )
//           )
//           .slice(0, 200);
//       });

//     console.log(
//       safeJson(globals)
//     );
//   } catch (e) {
//     err(
//       "Global debug failed:",
//       e?.message
//     );
//   }
// }

// /* ============================================================
//    DEBUG: STORAGE / COOKIES
//    ============================================================ */

// async function dumpStorage(page) {
//   console.log(
//     "\n[STORAGE DEBUG]"
//   );

//   try {
//     const storage =
//       await page.evaluate(() => {
//         const local = {};

//         for (
//           let i = 0;
//           i < localStorage.length;
//           i++
//         ) {
//           const key =
//             localStorage.key(i);

//           local[key] =
//             localStorage.getItem(key);
//         }

//         const session = {};

//         for (
//           let i = 0;
//           i < sessionStorage.length;
//           i++
//         ) {
//           const key =
//             sessionStorage.key(i);

//           session[key] =
//             sessionStorage.getItem(key);
//         }

//         return {
//           localStorage: local,
//           sessionStorage: session,
//         };
//       });

//     console.log(
//       safeJson(storage)
//     );
//   } catch (e) {
//     err(
//       "Storage debug failed:",
//       e?.message
//     );
//   }

//   try {
//     const cookies =
//       await page.context().cookies();

//     console.log(
//       "[COOKIES]",
//       safeJson(
//         cookies.map((cookie) => ({
//           name: cookie.name,
//           value:
//             cookie.value.length > 300
//               ? cookie.value.slice(0, 300) +
//                 "...[truncated]"
//               : cookie.value,
//           domain: cookie.domain,
//           path: cookie.path,
//           expires: cookie.expires,
//           httpOnly: cookie.httpOnly,
//           secure: cookie.secure,
//           sameSite: cookie.sameSite,
//         }))
//       )
//     );
//   } catch (e) {
//     err(
//       "Cookie debug failed:",
//       e?.message
//     );
//   }
// }

// /* ============================================================
//    DEBUG: PRICE AREA
//    ============================================================ */

// async function inspectPriceArea(page) {
//   console.log(
//     "\n[PRICE AREA DEBUG]"
//   );

//   const result =
//     await page.evaluate(() => {
//       const selectors = [
//         ".offer-panel",
//         ".offer-row",
//         ".price-value",
//         ".amount",
//         "[data-price='true']",
//         "[class*='price']",
//         "[class*='amount']",
//       ];

//       const elements = [];

//       for (const selector of selectors) {
//         for (const el of document.querySelectorAll(
//           selector
//         )) {
//           const rect =
//             el.getBoundingClientRect();

//           const style =
//             getComputedStyle(el);

//           elements.push({
//             selector,
//             tag: el.tagName,
//             className: el.className,
//             text:
//               el.innerText,
//             textContent:
//               el.textContent,
//             ariaHidden:
//               el.getAttribute(
//                 "aria-hidden"
//               ),
//             dataPrice:
//               el.getAttribute(
//                 "data-price"
//               ),
//             display:
//               style.display,
//             visibility:
//               style.visibility,
//             opacity:
//               style.opacity,
//             pointerEvents:
//               style.pointerEvents,
//             rect: {
//               x: rect.x,
//               y: rect.y,
//               width: rect.width,
//               height: rect.height,
//             },
//             outerHTML:
//               el.outerHTML.slice(
//                 0,
//                 8000
//               ),
//           });
//         }
//       }

//       return elements;
//     });

//   console.log(
//     safeJson(result)
//   );
// }

// /* ============================================================
//    DEBUG: TAKE SCREENSHOT
//    ============================================================ */

// async function takeDebugScreenshot(
//   page,
//   name = "debug"
// ) {
//   try {
//     const safeName =
//       String(name)
//         .replace(/[^a-z0-9_-]/gi, "_")
//         .slice(0, 100);

//     const path =
//       `debug-${safeName}-${Date.now()}.png`;

//     await page.screenshot({
//       path,
//       fullPage: true,
//     });

//     console.log(
//       `[DEBUG] Screenshot saved: ${path}`
//     );

//     return path;
//   } catch (e) {
//     err(
//       "Screenshot failed:",
//       e?.message
//     );

//     return null;
//   }
// }

// /* ============================================================
//    DEBUG: SAVE HTML
//    ============================================================ */

// async function saveDebugHTML(
//   page,
//   name = "debug"
// ) {
//   try {
//     const safeName =
//       String(name)
//         .replace(/[^a-z0-9_-]/gi, "_")
//         .slice(0, 100);

//     const html =
//       await page.content();

//     const path =
//       `debug-${safeName}-${Date.now()}.html`;

//     // NOTE:
//     // Node 24 has fs/promises.
//     const fs =
//       await import("node:fs/promises");

//     await fs.writeFile(
//       path,
//       html,
//       "utf8"
//     );

//     console.log(
//       `[DEBUG] HTML saved: ${path}`
//     );

//     return path;
//   } catch (e) {
//     err(
//       "HTML save failed:",
//       e?.message
//     );

//     return null;
//   }
// }

// /* ============================================================
//    DEBUG: HOVER PRICE AREA
//    ============================================================ */

// async function debugHoverPriceArea(page) {
//   console.log(
//     "\n[HOVER DEBUG] Testing price area hover..."
//   );

//   const selectors = [
//     ".offer-panel",
//     ".offer-row",
//     ".price-value",
//     "[data-price='true']",
//     "[class*='price']",
//     "[class*='amount']",
//   ];

//   for (const selector of selectors) {
//     try {
//       const locator =
//         page.locator(selector).first();

//       if (
//         !(await locator.count())
//       ) {
//         continue;
//       }

//       if (
//         !(await locator.isVisible().catch(() => false))
//       ) {
//         continue;
//       }

//       console.log(
//         `[HOVER DEBUG] Hovering: ${selector}`
//       );

//       await locator.scrollIntoViewIfNeeded();

//       const box =
//         await locator.boundingBox();

//       console.log(
//         `[HOVER DEBUG] Bounding box for ${selector}:`,
//         box
//       );

//       await locator.hover({
//         force: true,
//       });

//       console.log(
//         `[HOVER DEBUG] Hover sent: ${selector}`
//       );

//       await sleep(1000);

//       await dumpOffer(
//         page,
//         `after hover ${selector}`
//       );

//       await inspectPriceButton(page);
//     } catch (e) {
//       console.log(
//         `[HOVER DEBUG] ${selector} failed:`,
//         e.message
//       );
//     }
//   }
// }

// /* ============================================================
//    DEBUG: MOUSE MOVE AROUND PRICE BUTTON
//    ============================================================ */

// async function debugMouseMovement(page) {
//   console.log(
//     "\n[MOUSE DEBUG] Moving mouse around price button..."
//   );

//   const selector =
//     'button[aria-label="Check today’s price"], button[aria-label="Check today\'s price"]';

//   const button =
//     page.locator(selector).first();

//   if (
//     !(await button.count())
//   ) {
//     warn(
//       "[MOUSE DEBUG] Button not found."
//     );

//     return;
//   }

//   await button.scrollIntoViewIfNeeded();

//   const box =
//     await button.boundingBox();

//   if (!box) {
//     warn(
//       "[MOUSE DEBUG] Button has no bounding box."
//     );

//     return;
//   }

//   console.log(
//     "[MOUSE DEBUG] Button box:",
//     box
//   );

//   const points = [
//     {
//       name: "above",
//       x:
//         box.x + box.width / 2,
//       y:
//         box.y - 30,
//     },

//     {
//       name: "center",
//       x:
//         box.x + box.width / 2,
//       y:
//         box.y + box.height / 2,
//     },

//     {
//       name: "left",
//       x:
//         box.x - 30,
//       y:
//         box.y + box.height / 2,
//     },

//     {
//       name: "right",
//       x:
//         box.x + box.width + 30,
//       y:
//         box.y + box.height / 2,
//     },

//     {
//       name: "below",
//       x:
//         box.x + box.width / 2,
//       y:
//         box.y + box.height + 30,
//     },
//   ];

//   for (const point of points) {
//     console.log(
//       `[MOUSE DEBUG] Moving to ${point.name}:`,
//       point
//     );

//     await page.mouse.move(
//       point.x,
//       point.y
//     );

//     await sleep(500);

//     await inspectPriceButton(page);
//   }
// }

// /* ============================================================
//    GET OFFER STATE
//    ============================================================ */

// async function getOfferState(page) {
//   try {
//     return await page.evaluate(() => {
//       const panel =
//         document.querySelector(
//           ".offer-panel"
//         );

//       if (!panel) {
//         return {
//           exists: false,
//         };
//       }

//       const button =
//         panel.querySelector("button");

//       const text =
//         panel.innerText || "";

//       let state = "unknown";

//       if (
//         /price locked/i.test(text)
//       ) {
//         state = "locked";
//       }

//       if (
//         /member price/i.test(text) ||
//         /stock:/i.test(text) ||
//         /saving/i.test(text) ||
//         panel.classList.contains(
//           "offer-ready"
//         )
//       ) {
//         state = "ready";
//       }

//       return {
//         exists: true,
//         state,
//         className:
//           panel.className,
//         text,
//         button: button
//           ? {
//               text: button.innerText,
//               disabled:
//                 button.disabled,
//               ariaLabel:
//                 button.getAttribute(
//                   "aria-label"
//                 ),
//             }
//           : null,
//         html:
//           panel.outerHTML.slice(
//             0,
//             15000
//           ),
//       };
//     });
//   } catch (e) {
//     return {
//       error:
//         e?.message || String(e),
//     };
//   }
// }

// /* ============================================================
//    WAIT FOR OFFER CHANGE
//    ============================================================ */

// async function waitForOfferChange(
//   page,
//   previousState,
//   timeout = 5000
// ) {
//   const start =
//     Date.now();

//   let lastState =
//     previousState;

//   while (
//     Date.now() - start <
//     timeout
//   ) {
//     await sleep(250);

//     const current =
//       await getOfferState(page);

//     lastState =
//       current;

//     if (
//       JSON.stringify(current) !==
//       JSON.stringify(previousState)
//     ) {
//       return {
//         changed: true,
//         state: current,
//       };
//     }
//   }

//   return {
//     changed: false,
//     state: lastState,
//   };
// }

// /* ============================================================
//    PRICE BUTTON CLICK DEBUG
//    ============================================================ */

// async function clickPriceButtonDebug(
//   page,
//   attempt = 1
// ) {
//   console.log(
//     `\n[CLICK DEBUG] ========================================`
//   );

//   console.log(
//     `[CLICK DEBUG] Click attempt ${attempt}`
//   );

//   await inspectPriceButton(page);
//   await inspectHitTest(page);
//   await inspectConsent(page);
//   await dumpOffer(
//     page,
//     `before click ${attempt}`
//   );

//   const selector =
//     'button[aria-label="Check today’s price"], button[aria-label="Check today\'s price"]';

//   const button =
//     page.locator(selector).first();

//   if (
//     !(await button.count())
//   ) {
//     throw new Error(
//       "Price button disappeared."
//     );
//   }

//   await button.scrollIntoViewIfNeeded();

//   console.log(
//     "[CLICK DEBUG] Scrolled button into view."
//   );

//   await sleep(300);

//   /*
//    * First check consent.
//    */
//   await handleConsent(page);

//   await inspectHitTest(page);

//   /*
//    * Read disabled state.
//    */
//   const disabled =
//     await button.isDisabled().catch(
//       () => false
//     );

//   console.log(
//     `[CLICK DEBUG] Button disabled = ${disabled}`
//   );

//   if (disabled) {
//     console.log(
//       "[CLICK DEBUG] Button is disabled."
//     );

//     /*
//      * IMPORTANT:
//      * Don't silently fake a click.
//      * We only remove disabled temporarily
//      * for diagnostics so we can determine whether
//      * the site relies on DOM state.
//      */
//     await button.evaluate((el) => {
//       console.log(
//         "[scraper-debug] Removing disabled for diagnostic click"
//       );

//       el.removeAttribute(
//         "disabled"
//       );
//     });

//     console.log(
//       "[CLICK DEBUG] disabled attribute removed FOR DEBUG."
//     );

//     await sleep(200);

//     await inspectPriceButton(page);
//     await inspectHitTest(page);
//   }

//   /*
//    * Hover before click.
//    */
//   console.log(
//     "[CLICK DEBUG] Hovering price button..."
//   );

//   try {
//     await button.hover({
//       force: true,
//     });
//   } catch (e) {
//     console.log(
//       "[CLICK DEBUG] Button hover failed:",
//       e.message
//     );
//   }

//   await sleep(700);

//   console.log(
//     "[CLICK DEBUG] State after button hover:"
//   );

//   await inspectPriceButton(page);
//   await dumpOffer(
//     page,
//     "after button hover"
//   );

//   /*
//    * Mouse movement into button.
//    */
//   const box =
//     await button.boundingBox();

//   console.log(
//     "[CLICK DEBUG] Button bounding box:",
//     box
//   );

//   if (box) {
//     await page.mouse.move(
//       box.x - 40,
//       box.y + box.height / 2
//     );

//     await sleep(300);

//     await page.mouse.move(
//       box.x + box.width / 2,
//       box.y + box.height / 2,
//       {
//         steps: 10,
//       }
//     );

//     await sleep(500);
//   }

//   console.log(
//     "[CLICK DEBUG] State after mouse movement:"
//   );

//   await inspectPriceButton(page);
//   await inspectHitTest(page);

//   /*
//    * Save state before click.
//    */
//   const before =
//     await getOfferState(page);

//   console.log(
//     "[CLICK DEBUG] OFFER BEFORE CLICK:"
//   );

//   console.log(
//     safeJson(before)
//   );

//   /*
//    * Normal Playwright click.
//    */
//   try {
//     console.log(
//       "[CLICK DEBUG] Trying normal Playwright click..."
//     );

//     await button.click({
//       timeout: 5000,
//       trial: false,
//     });

//     console.log(
//       "[CLICK DEBUG] Normal Playwright click SUCCESS."
//     );
//   } catch (e) {
//     console.log(
//       "[CLICK DEBUG] Normal Playwright click FAILED:"
//     );

//     console.log(
//       e?.stack || e?.message || e
//     );

//     /*
//      * Check whether overlay is blocking.
//      */
//     console.log(
//       "[CLICK DEBUG] Running hit-test after normal click failure..."
//     );

//     await inspectHitTest(page);

//     /*
//      * Diagnostic DOM click.
//      */
//     try {
//       console.log(
//         "[CLICK DEBUG] Trying DOM element.click() for diagnostics..."
//       );

//       await button.evaluate((el) => {
//         el.click();
//       });

//       console.log(
//         "[CLICK DEBUG] DOM element.click() SUCCESS."
//       );
//     } catch (domError) {
//       console.log(
//         "[CLICK DEBUG] DOM element.click() FAILED:",
//         domError?.stack ||
//           domError?.message ||
//           domError
//       );
//     }
//   }

//   /*
//    * Wait for React / network / DOM changes.
//    */
//   console.log(
//     "[CLICK DEBUG] Waiting 500ms..."
//   );

//   await sleep(500);

//   console.log(
//     "[CLICK DEBUG] Waiting for possible offer state change..."
//   );

//   const change =
//     await waitForOfferChange(
//       page,
//       before,
//       5000
//     );

//   console.log(
//     "[CLICK DEBUG] Offer state changed:",
//     change.changed
//   );

//   console.log(
//     "[CLICK DEBUG] Current state:"
//   );

//   console.log(
//     safeJson(change.state)
//   );

//   await dumpOffer(
//     page,
//     `after click ${attempt}`
//   );

//   await inspectPriceButton(page);
//   await inspectHitTest(page);

//   console.log(
//     `[CLICK DEBUG] ========================================`
//   );

//   return change.state;
// }

// /* ============================================================
//    SELECT OPTION
//    ============================================================ */

// async function selectRandomOption(page) {
//   console.log(
//     "\n[OPTIONS] Reading product options..."
//   );

//   const groups =
//     page.locator(
//       ".opt-picker"
//     );

//   const groupCount =
//     await groups.count();

//   console.log(
//     `[OPTIONS] Option groups found: ${groupCount}`
//   );

//   if (!groupCount) {
//     console.log(
//       "[OPTIONS] No .opt-picker found."
//     );

//     return null;
//   }

//   const group =
//     groups.first();

//   const axis =
//     await group
//       .getAttribute("aria-label")
//       .catch(() => null);

//   console.log(
//     `[OPTIONS] Axis: ${axis}`
//   );

//   const options =
//     group.locator(
//       "button.opt-chip"
//     );

//   const count =
//     await options.count();

//   console.log(
//     `[OPTIONS] Buttons found: ${count}`
//   );

//   const optionData = [];

//   for (let i = 0; i < count; i++) {
//     const option =
//       options.nth(i);

//     optionData.push({
//       index: i,

//       text:
//         await option.innerText(),

//       ariaPressed:
//         await option.getAttribute(
//           "aria-pressed"
//         ),

//       disabled:
//         await option.isDisabled().catch(
//           () => false
//         ),

//       className:
//         await option.getAttribute(
//           "class"
//         ),
//     });
//   }

//   console.log(
//     "[OPTIONS] Available options:"
//   );

//   console.log(
//     safeJson(optionData)
//   );

//   if (!count) {
//     return null;
//   }

//   const randomIndex =
//     Math.floor(
//       Math.random() * count
//     );

//   const selected =
//     options.nth(randomIndex);

//   const selectedText =
//     await selected.innerText();

//   console.log(
//     `[OPTIONS] Random option index: ${randomIndex}`
//   );

//   console.log(
//     `[OPTIONS] Random option selected: "${selectedText}"`
//   );

//   console.log(
//     "[OPTIONS] Clicking option..."
//   );

//   await selected.scrollIntoViewIfNeeded();

//   await selected.click({
//     force: true,
//   });

//   console.log(
//     "[OPTIONS] Option click sent."
//   );

//   await sleep(700);

//   await dumpOptions(page);

//   const confirmed =
//     await group
//       .locator(
//         'button[aria-pressed="true"]'
//       )
//       .first()
//       .innerText()
//       .catch(() => null);

//   console.log(
//     `[OPTIONS] Confirmed selected option: ${confirmed}`
//   );

//   return confirmed || selectedText;
// }

// /* ============================================================
//    MAIN SCRAPER
//    ============================================================ */

// export async function scrapeProductDetails(
//   url,
//   options = {}
// ) {
//   const browser =
//     await chromium.launch({
//       headless:
//         options.headless ?? false,

//       slowMo:
//         options.slowMo ?? 50,

//       args: [
//         "--disable-blink-features=AutomationControlled",
//       ],
//     });

//   const context =
//     await browser.newContext({
//       viewport: {
//         width: 1440,
//         height: 900,
//       },

//       locale: "en-IN",

//       timezoneId:
//         "Asia/Kolkata",
//     });

//   const page =
//     await context.newPage();

//   attachPageDebug(page);

//   /*
//    * Make browser debugging very verbose.
//    */
//   page.setDefaultTimeout(
//     8000
//   );

//   page.setDefaultNavigationTimeout(
//     30000
//   );

//   line();

//   log(
//     "Starting HEAVY DEBUG scraper"
//   );

//   log(
//     "URL:",
//     url
//   );

//   log(
//     "Browser:",
//     "Chromium"
//   );

//   log(
//     "Viewport:",
//     await page.evaluate(() => ({
//       width: window.innerWidth,
//       height: window.innerHeight,
//     }))
//   );

//   line();

//   try {
//     /* --------------------------------------------------------
//        INSTALL DEBUGGING BEFORE NAVIGATION
//        -------------------------------------------------------- */

//     await installMutationDebug(page);
//     await installEventDebug(page);

//     /* --------------------------------------------------------
//        NAVIGATE
//        -------------------------------------------------------- */

//     log(
//       "Opening product page..."
//     );

//     const response =
//       await page.goto(url, {
//         waitUntil: "domcontentloaded",
//         timeout: 30000,
//       });

//     console.log(
//       "[NAVIGATION] HTTP status:",
//       response?.status()
//     );

//     console.log(
//       "[NAVIGATION] Final URL:",
//       page.url()
//     );

//     await page.waitForLoadState(
//       "networkidle",
//       {
//         timeout: 15000,
//       }
//     ).catch(() => {
//       console.log(
//         "[NAVIGATION] networkidle timeout; continuing."
//       );
//     });

//     console.log(
//       "[NAVIGATION] Page loaded."
//     );

//     await sleep(1000);

//     /* --------------------------------------------------------
//        INITIAL DEBUG
//        -------------------------------------------------------- */

//     await dumpPageState(
//       page,
//       "INITIAL PAGE"
//     );

//     await dumpRelevantGlobals(
//       page
//     );

//     await dumpStorage(
//       page
//     );

//     await inspectConsent(
//       page
//     );

//     await dumpOptions(
//       page
//     );

//     await inspectPriceArea(
//       page
//     );

//     await dumpOffer(
//       page,
//       "initial offer"
//     );

//     /* --------------------------------------------------------
//        CONSENT
//        -------------------------------------------------------- */

//     await handleConsent(
//       page
//     );

//     await sleep(500);

//     /* --------------------------------------------------------
//        PRODUCT
//        -------------------------------------------------------- */

//     const productName =
//       await page
//         .locator("h1")
//         .first()
//         .innerText()
//         .catch(() => null);

//     console.log(
//       `[PRODUCT] Product: ${productName}`
//     );

//     /* --------------------------------------------------------
//        OPTIONS
//        -------------------------------------------------------- */

//     const selectedOption =
//       await selectRandomOption(
//         page
//       );

//     console.log(
//       `[PRODUCT] Selected option: ${selectedOption}`
//     );

//     await sleep(500);

//     /*
//      * Important:
//      * Selecting option can cause React state update.
//      */
//     await dumpOffer(
//       page,
//       "after option selection"
//     );

//     await inspectPriceButton(
//       page
//     );

//     await inspectHitTest(
//       page
//     );

//     /* --------------------------------------------------------
//        HOVER EXPERIMENT
//        -------------------------------------------------------- */

//     console.log(
//       "\n[EXPERIMENT] ========================================"
//     );

//     console.log(
//       "[EXPERIMENT] Testing price area hover BEFORE clicks."
//     );

//     await debugHoverPriceArea(
//       page
//     );

//     await debugMouseMovement(
//       page
//     );

//     console.log(
//       "[EXPERIMENT] ========================================\n"
//     );

//     /* --------------------------------------------------------
//        CONSENT AGAIN
//        -------------------------------------------------------- */

//     await handleConsent(
//       page
//     );

//     /* --------------------------------------------------------
//        PRICE BUTTON
//        -------------------------------------------------------- */

//     console.log(
//       "\n[PRICE] Looking for Check today's price button..."
//     );

//     const priceButton =
//       page.locator(
//         'button[aria-label="Check today’s price"], button[aria-label="Check today\'s price"]'
//       ).first();

//     if (
//       !(await priceButton.count())
//     ) {
//       throw new Error(
//         "Check today's price button not found."
//       );
//     }

//     console.log(
//       "[PRICE] Check price button FOUND."
//     );

//     /* --------------------------------------------------------
//        THREE DEBUG CLICKS
//        -------------------------------------------------------- */

//     let finalState =
//       await getOfferState(page);

//     console.log(
//       "[PRICE] Initial offer state:"
//     );

//     console.log(
//       safeJson(finalState)
//     );

//     for (
//       let attempt = 1;
//       attempt <= 3;
//       attempt++
//     ) {
//       console.log(
//         `\n[PRICE] ===== CLICK ${attempt}/3 =====`
//       );

//       try {
//         finalState =
//           await clickPriceButtonDebug(
//             page,
//             attempt
//           );
//       } catch (e) {
//         err(
//           `[PRICE] Click ${attempt} threw error:`,
//           e?.stack ||
//             e?.message ||
//             e
//         );
//       }

//       await sleep(1000);

//       const current =
//         await getOfferState(
//           page
//         );

//       console.log(
//         `[PRICE] State after click ${attempt}:`
//       );

//       console.log(
//         safeJson(current)
//       );

//       if (
//         current?.state ===
//         "ready"
//       ) {
//         console.log(
//           `\n[PRICE] SUCCESS: offer became READY after click ${attempt}`
//         );

//         finalState =
//           current;

//         break;
//       }
//     }

//     /* --------------------------------------------------------
//        FINAL DIAGNOSTICS
//        -------------------------------------------------------- */

//     line();

//     console.log(
//       "[FINAL DEBUG] Scraper finished. Dumping EVERYTHING."
//     );

//     await dumpPageState(
//       page,
//       "FINAL PAGE"
//     );

//     await dumpOffer(
//       page,
//       "FINAL OFFER"
//     );

//     await inspectPriceButton(
//       page
//     );

//     await inspectHitTest(
//       page
//     );

//     await inspectConsent(
//       page
//     );

//     await inspectPriceArea(
//       page
//     );

//     await dumpOptions(
//       page
//     );

//     await dumpRelevantGlobals(
//       page
//     );

//     /* --------------------------------------------------------
//        FINAL SCREENSHOT / HTML
//        -------------------------------------------------------- */

//     const screenshot =
//       await takeDebugScreenshot(
//         page,
//         finalState?.state === "ready"
//           ? "success"
//           : "failure"
//       );

//     const html =
//       await saveDebugHTML(
//         page,
//         finalState?.state === "ready"
//           ? "success"
//           : "failure"
//       );

//     /* --------------------------------------------------------
//        FINAL RESULT
//        -------------------------------------------------------- */

//     if (
//       finalState?.state !==
//       "ready"
//     ) {
//       line();

//       console.log(
//         "[scraper] FAILED"
//       );

//       console.log(
//         "[scraper] Final offer state:",
//         finalState?.state
//       );

//       console.log(
//         "[scraper] Final offer:"
//       );

//       console.log(
//         finalState?.text ||
//           "No offer text"
//       );

//       console.log(
//         "[scraper] Debug screenshot:",
//         screenshot
//       );

//       console.log(
//         "[scraper] Debug HTML:",
//         html
//       );

//       line();

//       return {
//         success: false,

//         productName,

//         selectedOption,

//         offerState:
//           finalState,

//         debugScreenshot:
//           screenshot,

//         debugHtml:
//           html,
//       };
//     }

//     line();

//     console.log(
//       "[scraper] SUCCESS"
//     );

//     console.log(
//       "[scraper] Product:",
//       productName
//     );

//     console.log(
//       "[scraper] Option:",
//       selectedOption
//     );

//     console.log(
//       "[scraper] Offer:"
//     );

//     console.log(
//       safeJson(finalState)
//     );

//     line();

//     return {
//       success: true,

//       productName,

//       selectedOption,

//       offerState:
//         finalState,

//       debugScreenshot:
//         screenshot,

//       debugHtml:
//         html,
//     };
//   } catch (e) {
//     line();

//     err(
//       "SCRAPER CRASHED"
//     );

//     err(
//       e?.stack ||
//         e?.message ||
//         e
//     );

//     /* --------------------------------------------------------
//        CRASH DIAGNOSTICS
//        -------------------------------------------------------- */

//     try {
//       await dumpPageState(
//         page,
//         "CRASH STATE"
//       );

//       await dumpOffer(
//         page,
//         "CRASH OFFER"
//       );

//       await inspectPriceButton(
//         page
//       );

//       await inspectHitTest(
//         page
//       );

//       await inspectConsent(
//         page
//       );

//       await inspectPriceArea(
//         page
//       );
//     } catch (debugError) {
//       err(
//         "Crash diagnostics themselves failed:",
//         debugError?.message
//       );
//     }

//     const screenshot =
//       await takeDebugScreenshot(
//         page,
//         "crash"
//       );

//     const html =
//       await saveDebugHTML(
//         page,
//         "crash"
//       );

//     err(
//       "Crash screenshot:",
//       screenshot
//     );

//     err(
//       "Crash HTML:",
//       html
//     );

//     throw e;
//   } finally {
//     console.log(
//       "\n[scraper] Closing browser..."
//     );

//     await browser.close();

//     console.log(
//       "[scraper] Browser closed."
//     );
//   }
// }

// /* ============================================================
//    DEFAULT EXPORT
//    ============================================================ */

// export default scrapeProductDetails;