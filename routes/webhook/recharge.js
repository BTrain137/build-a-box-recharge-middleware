const { Router } = require("express");
const { updateSubscriptionPrice } = require("../../Recharge/subscriptions");
const { getOriginalVariantPrice } = require("../../Shopify/product");
const router = Router();

// /webhook/recharge/order-created
router.post("/order-created", async (req, res) => {
  const { order } = req.body;
  const { tags, line_items, shopify_order_number } = order;
  console.log("+++++++++++++++++++++++++++++++++++");
  console.log("++++++++++++++Start++++++++++++++++");
  console.log("shopify_order_number", shopify_order_number);
  if (tags.includes("Subscription First Order")) {
    const eligibleItems = [];
    for (let i = 0; i < line_items.length; i++) {
      const line_item = line_items[i];
      const { subscription_id, unit_price, properties } = line_item;
      const isBabItem = properties.some(({ name }) => name == "_bundle");
      if (isBabItem) {
        eligibleItems.push({
          subscription_id,
          unit_price,
        });
      }
    }
    if (eligibleItems.length === 0) {
      return;
    }

    for (let j = 0; j < eligibleItems.length; j++) {
      const item = eligibleItems[j];
      const { subscription_id, unit_price } = item;
      const results = await updateSubscriptionPrice(
        subscription_id,
        unit_price
      );
      const { product_title } = results.subscription;
      console.log(`#${j}`, product_title);
    }
  } else {
    console.log("Don't Process");
  }
  console.log("++++++++++++++END++++++++++++++++");
  console.log("+++++++++++++++++++++++++++++++++");
  res.sendStatus(200);
});

// /webhook/recharge/order-created-all-subscription
// Old Recharge style
router.post("/order-created-all-subscription", async (req, res) => {
  const { order } = req.body;
  const { tags, line_items, shopify_order_number } = order;
  console.log("+++++++++++++++++++++++++++++++++++");
  console.log("++++++++++++++Start++++++++++++++++");
  console.log("shopify_order_number", shopify_order_number);
  if (tags.includes("Subscription First Order")) {
    const eligibleItems = [];
    for (let i = 0; i < line_items.length; i++) {
      const line_item = line_items[i];
      const { subscription_id, unit_price, properties } = line_item;
      const isSubscriptionItem = properties.some(
        ({ name }) => name == "shipping_interval_unit_type"
      );
      if (isSubscriptionItem) {
        eligibleItems.push({
          subscription_id,
          unit_price,
        });
      }
    }
    if (eligibleItems.length === 0) {
      return;
    }

    for (let j = 0; j < eligibleItems.length; j++) {
      const item = eligibleItems[j];
      const { subscription_id, unit_price } = item;
      const results = await updateSubscriptionPrice(
        subscription_id,
        unit_price
      );
      const { product_title } = results.subscription;
      console.log(`#${j}`, product_title);
    }
  } else {
    console.log("Don't Process");
  }
  console.log("++++++++++++++END++++++++++++++++");
  console.log("+++++++++++++++++++++++++++++++++");
  res.sendStatus(200);
});

// /webhook/recharge/order-created--allow-all
router.post("/order-created--allow-all", async (req, res) => {
  console.log(JSON.stringify(req.body));
  const { order } = req.body;
  const { tags, line_items, shopify_order_number } = order;
  console.log("+++++++++++++++++++++++++++++++++++");
  console.log("++++++++++++++Start++++++++++++++++");
  console.log("shopify_order_number", shopify_order_number);
  if (tags.includes("Subscription First Order")) {
    const eligibleItems = [];
    for (let i = 0; i < line_items.length; i++) {
      const line_item = line_items[i];
      const {
        subscription_id,
        shopify_product_id,
        shopify_variant_id,
        quantity,
        properties,
      } = line_item;
      const isSubscriptionItem = properties.some(
        ({ name }) => name === "shipping_interval_frequency"
      );
      if (!isSubscriptionItem) {
        continue;
      }
      eligibleItems.push({
        subscription_id,
        shopify_product_id,
        shopify_variant_id,
        quantity,
      });
    }

    if (eligibleItems.length === 0) {
      return res.sendStatus(200);
    }

    const totalQty = eligibleItems.reduce((acc, { quantity }) => {
      return acc + quantity;
    }, 0);

    if (totalQty === 1) {
      return res.sendStatus(200);
    }

    const discountAmountPercent = totalQty >= 3 ? 0.75 : 0.85;

    for (let j = 0; j < eligibleItems.length; j++) {
      const item = eligibleItems[j];
      const { subscription_id, shopify_product_id, shopify_variant_id } = item;
      let results;
      try {
        const originalPrice = await getOriginalVariantPrice(
          shopify_product_id,
          shopify_variant_id
        );
        const price = (originalPrice * discountAmountPercent).toFixed(2);
        results = await updateSubscriptionPrice(subscription_id, price);
      } catch (error) {
        res.sendStatus(500);
        console.log(error);
      }
      const { product_title } = results.subscription;
      console.log(`#${j}`, product_title);
    }
  } else {
    console.log("Don't Process");
  }
  console.log("++++++++++++++END++++++++++++++++");
  console.log("+++++++++++++++++++++++++++++++++");
  res.sendStatus(200);
});

module.exports = router;
