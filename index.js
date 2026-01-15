require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ===== SIMPLE CACHE =====
let cache = {};
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

app.get("/api/coins", async (req, res) => {
  const symbols = req.query.symbols || "ATC";
  const now = Date.now();

  // Serve from cache
  if (
    cache[symbols] &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return res.json(cache[symbols]);
  }

  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
        },
        params: {
          symbol: symbols,
          convert: "USD",
        },
      }
    );

    const coins = Object.values(response.data.data).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      change24h: coin.quote.USD.percent_change_24h,
      marketCap: coin.quote.USD.market_cap,
      logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    }));

    // Save to cache
    cache[symbols] = coins;
    lastFetchTime = now;

    res.json(coins);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});





















// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// const PORT = process.env.PORT || 3000;

// app.get("/api/coins", async (req, res) => {
//   const symbols = req.query.symbols || "ATC";

//   try {
//     const response = await axios.get(
//       "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
//       {
//         headers: {
//           "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
//         },
//         params: {
//           symbol: symbols,
//           convert: "USD",
//         },
//       }
//     );

//     const coins = Object.values(response.data.data).map((coin) => ({
//       id: coin.id,
//       name: coin.name,
//       symbol: coin.symbol,
//       price: coin.quote.USD.price,
//       change24h: coin.quote.USD.percent_change_24h,
//       marketCap: coin.quote.USD.market_cap,
//       logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
//     }));

//     res.json(coins);
//   } catch (error) {
//     res.status(500).json({
//       error: error.response?.data || error.message,
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log("Server running on port", PORT);
// });
