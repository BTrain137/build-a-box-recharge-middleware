const axiosRequest = require("./axiosRequest.js");

const { SHOPIFY_SHOP, SHOPIFY_ACCESS_TOKEN, SHOPIFY_API_VERSION } = process.env;

const buildAxiosBody = (query, variables) => {
    const option = {
      url: `https://${SHOPIFY_SHOP}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
      method: 'post',
      data: {
        query: query,
        variables: variables,
      },
    }
    
    try {
      const data = await axiosRequest(option);
      return data;
    } catch (error) {
      throw error;
    }
}

module.exports = buildAxiosBody;
