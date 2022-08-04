const axiosRequest = require("../Helpers/axiosRequest");

const { SHOPIFY_ACCESS_TOKEN, SHOPIFY_SHOP, SHOPIFY_API_VERSION } = process.env;

const getOriginalVariantPrice = async (productId, variantId) => {
  const query = {
    url: `https://${SHOPIFY_SHOP}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    method: "GET",
  };

  try {
    const results = await axiosRequest(query);
    const { variants } = results.product;
    const [variant] = variants.filter(({ id }) => id === variantId);
    const { price } = variant;
    return parseFloat(price);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getOriginalVariantPrice,
};
