import React, { useState, useEffect } from "react";
import axios from "axios";
import Coin from "./components/Coin";
import "./Coin.css";
import "./App.css";

export function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("inr");
  // const ref = useRef();

  // Making an API Call only on mount
  useEffect(() => {
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=50&page=1&sparkline=false`
      )
      .then((res) => {
        setCoins(res.data);
      }) //storing the crypto data in coins state
      .catch((e) => console.log(e));
  }, [currency]);

  const dictionary = {
    inr: "₹",
    usd: "$",
    eur: "€",
    gbp: "£",
    cad: "$",
    jpy: "¥",
    aud: "$",
    chf: "₣",
  };

  const handleChange = (e) => {
    // console.log(e.target.value);
    setSearch(e.target.value); //value entered in the search box stored in search state
  };

  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  ); //filtering to show only matching coins containing the words entered in searchbox

  return (
    <div className="coin-app">
      <div className="coin-search">
        <h1 className="coin-text">Crypto Price Tracker</h1>
        <form>
          <input
            type="text"
            className="coin-input"
            placeholder="Search"
            onChange={handleChange}
          ></input>
        </form>
      </div>
      <div className="toggle-currency">
        <label>Currency: </label>
        <select
          onChange={(e) => setCurrency(e.target.value)}
          id="toggle-currency"
        >
          <option value="inr">INR</option>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="gbp">GBP</option>
          <option value="cad">CAD</option>
          <option value="jpy">JPY</option>
          <option value="aud">AUD</option>
          <option value="chf">CHF</option>
        </select>
      </div>
      {console.log(currency)}
      {/* For each filtered coin pass the details to Coin component to display */}
      {filteredCoins.map((coin) => {
        return (
          <Coin
            key={coin.id}
            name={coin.name}
            image={coin.image}
            symbol={coin.symbol}
            price={coin.current_price}
            marketCap={coin.market_cap}
            priceChange={coin.price_change_percentage_24h}
            volume={coin.total_volume}
            currencysymbol={dictionary[currency]}
          />
        );
      })}
    </div>
  );
}

export default App;
