// export const scrapeProductDetails = async (url) => {
  
//   // yahan tumhara scraping logic aayega
//   // jo iss format me real result return kree
//   // const result = {
//   //   productId: "awa46g",
//   //   productName: "iPhone 15",
//   //   option: "128GB",
//   //   timestamp: new Date().toISOString(),
//   //   price: 57999,
//   //   stock: "In Stock",
//   //   outcome: "success",
//   // };

//   const result = {};

//   return result;
// };



import { chromium } from "playwright";

export const scrapeProductDetails = async (url) => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(url);

    // =========================
    // STEP 1: COOKIE POPUP
    // =========================

    const cookie_button = page.getByRole(
        "button",
        { name: "Allow cookies" }
    );

    try {
        await cookie_button.waitFor({
            state: "visible",
            timeout: 15000
        });

        await cookie_button.click();

        console.log("Cookie popup mila -> close kar diya!");

    } catch (error) {
        if (error.name === "TimeoutError") {
            console.log("Cookie popup nahi aaya -> aage badh rahe hain.");
        } else {
            throw error;
        }
    }


    // =========================
    // STEP 2: PRICE AREA
    // =========================

    const price_area = page.locator(
        "div.offer-panel.offer-locked"
    );

    try {

        await price_area.waitFor({
            state: "visible",
            timeout: 10000
        });

        console.log("Price area mil gaya!");

        // =========================
        // STEP 3: HOVER
        // =========================

        console.log("Hover start...");

        for (let i = 0; i < 5; i++) {

            await price_area.hover();

            await page.waitForTimeout(500);

            await page.mouse.move(700, 600);

            await page.waitForTimeout(500);

            await price_area.hover();

            await page.waitForTimeout(500);

            console.log(`Hover ${i + 1}/5`);
        }

        console.log("5 hover cycles complete!");

    } catch (error) {

        if (error.name === "TimeoutError") {
            console.log("Price area nahi mila.");
        } else {
            throw error;
        }
    }


    // =========================
    // STEP 4: COOKIE CHECK
    // =========================

    const cookie_button_2 = page.getByRole(
        "button",
        { name: "Allow cookies" }
    );

    try {

        await cookie_button_2.waitFor({
            state: "visible",
            timeout: 3000
        });

        await cookie_button_2.click();

        console.log(
            "Hover ke baad cookie popup aaya -> close kar diya!"
        );

    } catch (error) {

        if (error.name === "TimeoutError") {
            console.log(
                "Hover ke baad cookie popup nahi aaya."
            );
        } else {
            throw error;
        }
    }


    // =========================
    // STEP 5: PRICE BUTTON + RETRY
    // =========================

    const price_button = page.locator(
        'button[aria-label="Check today’s price"]'
    );

    try {

        await price_button.waitFor({
            state: "visible",
            timeout: 5000
        });

        if (await price_button.isEnabled()) {

            console.log(
                "Price button ENABLED -> initial click"
            );

            await price_button.click();

            // Maximum 5 retry checks
            for (let attempt = 1; attempt < 6; attempt++) {

                await page.waitForTimeout(4000);

                const retry_button = page.getByRole(
                    "button",
                    { name: "Retry" }
                );

                try {

                    await retry_button.waitFor({
                        state: "visible",
                        timeout: 1000
                    });

                    console.log(
                        `Retry mila -> retry click ${attempt}`
                    );

                    await retry_button.click();

                } catch (error) {

                    if (error.name === "TimeoutError") {

                        console.log(
                            "Retry nahi aaya -> DONE"
                        );

                        break;

                    } else {
                        throw error;
                    }
                }
            }

            console.log("Retry handling complete.");

        } else {

            console.log(
                "Price button disabled hai."
            );
        }

    } catch (error) {

        if (error.name === "TimeoutError") {
            console.log("Price button nahi mila.");
        } else {
            throw error;
        }
    }


    // =========================
    // STEP 6: DYNAMIC SCRAPING
    // =========================

    const result = {
        productId: url.replace(/\/+$/, "").split("/").pop(),
        productName: "unknown",
        option: "unknown",
        timestamp: new Date().toISOString(),
        price: "unknown",
        stock: "unknown",
        outcome: "failed"
    };


    try {

        // =========================
        // PRODUCT NAME
        // =========================

        result.productName = (
            await page.locator("h1").innerText({
                timeout: 3000
            })
        ).trim();


        // =========================
        // SELECTED OPTION
        // =========================

        const selected_option = page.locator(
            'button.opt-chip[aria-pressed="true"]'
        );

        result.option = (
            await selected_option.innerText({
                timeout: 3000
            })
        ).trim();


        // =========================
        // SUCCESS PANEL
        // =========================

        const ready_offer = page.locator(
            "div.offer-panel.offer-ready"
        );

        await ready_offer.waitFor({
            state: "visible",
            timeout: 5000
        });

        console.log(
            "SUCCESS: offer-ready mil gaya!"
        );


        // =========================
        // PRICE
        // =========================

        const price_element = ready_offer.locator(
            "b, data"
        ).first;

        result.price = (
            await price_element.innerText({
                timeout: 3000
            })
        ).trim();

        result.price = result.price
            .replace("₹", "")
            .trim();


        // =========================
        // STOCK
        // =========================

        const stock_element = ready_offer.locator(
            ".avail-pill"
        );

        result.stock = (
            await stock_element.innerText({
                timeout: 3000
            })
        ).trim();


        // =========================
        // SUCCESS
        // =========================

        result.outcome = "success";


    } catch (error) {

        if (error.name === "TimeoutError") {

            console.log(
                "Offer load nahi hua -> FAILED"
            );

        } else {

            console.log(
                "Scraping error:",
                error
            );
        }

        result.price = "unknown";
        result.stock = "unknown";
        result.outcome = "failed";
    }


    // =========================
    // STEP 7: FAILED HUA TO
    //         RANDOM OPTION RETRY
    // =========================

    if (result.outcome === "failed") {

        console.log(
            "\nOriginal option FAILED."
        );

        console.log(
            "Dusre option se ek last attempt kar rahe hain..."
        );


        const options = page.locator(
            "button.opt-chip"
        );

        const option_count = await options.count();


        if (option_count > 1) {

            const current_option = (
                await page.locator(
                    'button.opt-chip[aria-pressed="true"]'
                ).innerText()
            ).trim();


            const available_options = [];


            for (let i = 0; i < option_count; i++) {

                const option_text = (
                    await options.nth(i).innerText()
                ).trim();

                if (option_text !== current_option) {
                    available_options.push(option_text);
                }
            }


            if (available_options.length > 0) {

                const random_option =
                    available_options[
                        Math.floor(
                            Math.random() *
                            available_options.length
                        )
                    ];


                console.log(
                    `Current option: ${current_option}`
                );

                console.log(
                    `Random retry option: ${random_option}`
                );


                // Option click
                await page.getByRole(
                    "button",
                    {
                        name: random_option,
                        exact: true
                    }
                ).click();


                console.log(
                    `Option '${random_option}' selected.`
                );


                // Option change hone ka wait
                await page.waitForTimeout(1000);


                // =========================
                // HOVER AGAIN
                // =========================

                console.log(
                    "Retry option ke liye hover start..."
                );


                const retry_price_area = page.locator(
                    "div.offer-panel.offer-locked"
                );


                try {

                    await retry_price_area.waitFor({
                        state: "visible",
                        timeout: 5000
                    });


                    for (let i = 0; i < 5; i++) {

                        await retry_price_area.hover();

                        await page.waitForTimeout(500);

                        await page.mouse.move(700, 600);

                        await page.waitForTimeout(500);

                        await retry_price_area.hover();

                        await page.waitForTimeout(500);

                        console.log(
                            `Retry hover ${i + 1}/5`
                        );
                    }

                } catch (error) {

                    if (error.name === "TimeoutError") {

                        console.log(
                            "Retry option ka price area nahi mila."
                        );

                    } else {
                        throw error;
                    }
                }


                // =========================
                // COOKIE CHECK
                // =========================

                const retry_cookie_button =
                    page.getByRole(
                        "button",
                        {
                            name: "Allow cookies"
                        }
                    );


                try {

                    await retry_cookie_button.waitFor({
                        state: "visible",
                        timeout: 3000
                    });

                    await retry_cookie_button.click();

                    console.log(
                        "Retry ke baad cookie popup close kiya."
                    );

                } catch (error) {

                    if (error.name === "TimeoutError") {

                        console.log(
                            "Retry ke baad cookie popup nahi aaya."
                        );

                    } else {
                        throw error;
                    }
                }


                // =========================
                // PRICE BUTTON
                // =========================

                const retry_price_button =
                    page.locator(
                        'button[aria-label="Check today’s price"]'
                    );


                try {

                    await retry_price_button.waitFor({
                        state: "visible",
                        timeout: 5000
                    });


                    if (
                        await retry_price_button.isEnabled()
                    ) {

                        console.log(
                            "Retry option ka price button -> click"
                        );

                        await retry_price_button.click();


                        // =========================
                        // RETRIES
                        // =========================

                        for (
                            let attempt = 1;
                            attempt < 6;
                            attempt++
                        ) {

                            await page.waitForTimeout(4000);


                            const retry_button =
                                page.getByRole(
                                    "button",
                                    {
                                        name: "Retry"
                                    }
                                );


                            try {

                                await retry_button.waitFor({
                                    state: "visible",
                                    timeout: 1000
                                });


                                console.log(
                                    `Retry option -> retry click ${attempt}`
                                );


                                await retry_button.click();

                            } catch (error) {

                                if (
                                    error.name ===
                                    "TimeoutError"
                                ) {

                                    console.log(
                                        "Retry nahi aaya -> DONE"
                                    );

                                    break;

                                } else {
                                    throw error;
                                }
                            }
                        }

                    } else {

                        console.log(
                            "Retry option ka price button disabled hai."
                        );
                    }

                } catch (error) {

                    if (error.name === "TimeoutError") {

                        console.log(
                            "Retry option ka price button nahi mila."
                        );

                    } else {
                        throw error;
                    }
                }


                // =========================
                // SCRAPE AGAIN
                // =========================

                console.log(
                    "Retry option ka result check kar rahe hain..."
                );


                try {

                    const ready_offer_2 =
                        page.locator(
                            "div.offer-panel.offer-ready"
                        );


                    await ready_offer_2.waitFor({
                        state: "visible",
                        timeout: 5000
                    });


                    // Product name
                    result.productName = (
                        await page.locator(
                            "h1"
                        ).innerText({
                            timeout: 3000
                        })
                    ).trim();


                    // Actual selected option
                    result.option = (
                        await page.locator(
                            'button.opt-chip[aria-pressed="true"]'
                        ).innerText({
                            timeout: 3000
                        })
                    ).trim();


                    // Price
                    const price_element_2 =
                        ready_offer_2.locator(
                            "b, data"
                        ).first;


                    result.price = (
                        await price_element_2.innerText({
                            timeout: 3000
                        })
                    ).trim();


                    result.price = result.price
                        .replace("₹", "")
                        .trim();


                    // Stock
                    result.stock = (
                        await ready_offer_2
                            .locator(".avail-pill")
                            .innerText({
                                timeout: 3000
                            })
                    ).trim();


                    // SUCCESS
                    result.outcome = "success";


                    console.log(
                        "SECOND OPTION SUCCESS!"
                    );

                } catch (error) {

                    if (error.name === "TimeoutError") {

                        console.log(
                            "Second option bhi FAILED."
                        );

                    } else {
                        throw error;
                    }
                }


            } else {

                console.log(
                    "Current option ke alawa koi option nahi mila."
                );
            }


        } else {

            console.log(
                "Sirf ek option available hai -> second attempt possible nahi."
            );
        }
    }


    // =========================
    // RETURN REAL RESULT
    // =========================

    await browser.close();

    return result;
};
