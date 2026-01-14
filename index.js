require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get("/api/coins", async (req, res) => {
  const symbols = req.query.symbols || "BTC,ETH";

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
      logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
    }));

    res.json(coins);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
