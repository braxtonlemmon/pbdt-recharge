require('path');
require('dotenv').config();
const fetch = require('node-fetch');

const rechargeToken = process.env.RECHARGE_TOKEN;

const subscriptionIntervalFrequency = process.env.SUBSCRIPTION_INTERVAL_FREQUENCY || 30;
const subscriptionIntervalUnit = process.env.SUBSCRIPTION_INTERVAL_UNIT || 'day';

// Build request headers
const buildHeaders = () => ({
  'X-Recharge-Access-Token': rechargeToken,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
});

exports.handler = async function(event, context) {
  try {
    const params = JSON.parse(event.body);

    // check for params and return error if there are no params
    if (!params || !params.line_items) {
      return { statusCode: 400, body: JSON.stringify({
        message: 'Missing parameters',
        data: ['line_items']
      }) }
    }

    // creates array of line items to be purchased
    const line_items = params.line_items.map((item) => {
      item = {
        ...item
      }

      if (item.is_subscription === true) {
        item.charge_interval_frequency = subscriptionIntervalFrequency;
        item.order_interval_frequency = subscriptionIntervalFrequency;
        item.order_interval_unit = subscriptionIntervalUnit;
      }

      delete item.is_subscription;

      return item;
    })

    // this is to get the needed checkout token
    const checkoutApiUrl = 'https://api.rechargeapps.com/checkouts';

    const response = await fetch(checkoutApiUrl, {
      headers: buildHeaders(),
      method: 'post',
      body: JSON.stringify({
        line_items
      })
    })

    if (!response.ok) {
      throw response;
    }

    // this generates the url to complete the checkout through recharge
    const checkoutUrl = `https://checkout.rechargeapps.com/r/checkout/${data.checkout.token}?myshopify_domain=${process.env.SHOPIFY_SHOP_NAME}.myshopify.com`;

    // the return for the try block, returns the checkout url
    return {
      statusCode: 200,
      body: JSON.stringify({
        webUrl: checkoutUrl
      })
    }
  }

  catch (err) {
    // return for the catch block
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ message: err.statusText || err.message || 'Internal Server Error' })
    }
  }
}


