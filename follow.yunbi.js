const Follower = require('./Follower');
const Yunbi = require('yunbi-api/yunbi-module.js');
const config = require('./config');

const authedClient = new Yunbi(
  config.yunbi.access_key,
  config.yunbi.secret_key
);

// Customize the pairs to listen for
const VICKI_PAIRS = ['ZECUSD', 'XMRBTC', 'ETHBTC', 'ETHUSD'];

// Set the fixed transaction size here or you can implement more logic in the
// callback functions below to dynamically determine the size
const TRADE_SIZE = 0.01;

const follower = new Follower(config, VICKI_PAIRS);


function get_market_price(currencyA, currencyB, column) {
  return new Promise( (resolve, reject) => {  
      authedClient.getOrderBook(currencyA, currencyB, null, null, (err, response) => {
        let data = JSON.parse(response);
        const price = data[column][1]['price'];
        //const {bids} = data;
        //const price = bids[1]['price'];
        resolve(price);
      });
  })
}

function do_buy(currencyA, currencyB) {
  get_market_price(currencyA, currencyB, 'bids').then(function(price) {
      authedClient.buy(currencyA, currencyB, price, TRADE_SIZE, (err, response) => {
        console.log(response);
      });
  });
}

function do_sell(currencyA, currencyB) {
  get_market_price(currencyA, currencyB, 'asks').then(function(price) {
      authedClient.sell(currencyA, currencyB, price, TRADE_SIZE, (err, response) => {
        console.log(response);
      });
  });
}

follower.onTweet('ETHUSD', 'long', function() {
  do_buy('ETH', 'CNY');
});

follower.onTweet('ETHUSD', 'short', function() {
  do_sell('ETH', 'CNY');
});

follower.startFollowing();
