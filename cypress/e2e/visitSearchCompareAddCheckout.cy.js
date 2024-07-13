describe("search for a product on Amazon and Flipkart, comparing the lowest-cost product available on both platforms and navigating through the purchase process", () => {
	const filePath = "cypress/fixtures/logProductDetails.json";

	//search for Ringke Onyx Compatible with Samsung Galaxy S23 Ultra in amazon
	it("Search for Ringke Onyx Compatible with Samsung Galaxy S23 Ultra on amazon and check price", () => {
		cy.writeFile(filePath, []);
		cy.visit("https://www.amazon.in/");
		cy.get('[id="twotabsearchtextbox"]').type(
			"Ringke Onyx Compatible with Samsung Galaxy S23 Ultra"
		);
		cy.get('[id="nav-search-submit-button"]').click();

		//wait for 2 seconds
		cy.wait(2000);

		//select item from the list
		cy.get(".s-desktop-content")
			.contains("Ringke Onyx Compatible with Samsung Galaxy S23 Ultra")
			.invoke("removeAttr", "target")
			.click();

		//wait for 2 seconds
		cy.wait(15000);

		//get product details for comparison
		cy.url().as("currentUrl");
		cy.get("body").then(($body) => {
			cy.get("@currentUrl").then((currentUrl) => {
				var product = {
					id: "amazon",
					title: $body.find("span#productTitle").text().trim(),
					price: $body
						.find(
							'#corePrice_feature_div > [data-csa-c-type="widget"] > .a-section > .a-price > [aria-hidden="true"]'
						)
						.text()
						.replace("₹", "")
						.trim(),
					url: currentUrl,
				};

				cy.readFile(filePath).then((logProductDetails) => {
					logProductDetails.push(product);
					cy.writeFile(filePath, logProductDetails);
				});
			});
		});
	});

	//search for Ringke Back Cover for Samsung Galaxy S23 Ultra 5G  (Green, Pack of: 1) on flipkart
	it("Search for Ringke Back Cover for Samsung Galaxy S23 Ultra 5G  (Green, Pack of: 1) on flipkart and check price", () => {
		cy.visit("https://www.flipkart.com/");
		cy.get('input[title="Search for Products, Brands and More"]').type(
			"Ringke Back Cover for Samsung Galaxy S23 Ultra 5G  (Green, Pack of: 1)"
		);
		cy.get('button[type="submit"]').click();

		//wait for 2 seconds
		cy.wait(2000);

		//select item from the list
		cy.get('a[title="Ringke Back Cover for Samsung Galaxy S23 Ultra 5G"]')
			.invoke("removeAttr", "target", "_self")
			.click();

		//get product details for comparison
		cy.url().as("currentUrl");
		cy.get("body").then(($body) => {
			cy.get("@currentUrl").then((currentUrl) => {
				var product = {
					id: "flipkart",
					title: $body.find("span.VU-ZEz").text().trim(),
					price: $body.find(".Nx9bqj.CxhGGd").text().replace("₹", "").trim(),
					url: currentUrl,
				};
				cy.readFile(filePath).then((logProductDetails) => {
					logProductDetails.push(product);
					cy.writeFile(filePath, logProductDetails);
				});
			});
		});
	});

	//Comparing the lowest-cost product available on both platforms.
	it("Comparing the lowest-cost product available on both platforms and navigating to add to cart and buy now.", () => {
		cy.readFile(filePath).then((logProductDetails) => {
			cy.log("All product details:", logProductDetails);
			function normalizePrice(price) {
				return parseFloat(price.replace(/,/g, ""));
			}
			const lowestPricedProduct = logProductDetails.reduce((prev, curr) => {
				return normalizePrice(curr.price) < normalizePrice(prev.price)
					? curr
					: prev;
			});

			if (lowestPricedProduct.id === "amazon") {
				cy.log("Lowest priced product:", lowestPricedProduct);
				cy.visit(lowestPricedProduct.url);
				cy.wait(15000);

				//add product to cart
				cy.get('[id="add-to-cart-button"]').click();
				cy.get('[id="attach-close_sideSheet-link"]').click();

				//navigate to buy now
				cy.get("#buy-now-button").click();
			}
			//add product to cart
			if (lowestPricedProduct.id === "flipkart") {
				cy.visit(lowestPricedProduct.url);
				cy.wait(15000);

				//navigate to buy now
				cy.get(".row > :nth-child(1) > .QqFHMw").trigger("click");
			}
		});
	});
});
