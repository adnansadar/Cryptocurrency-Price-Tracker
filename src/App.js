import React, { useState, useEffect } from "react";
import axios from "axios";
import Coin from "./components/Coin";
import "./Coin.css";
import "./App.css";

export function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");

  // Making an API Call only on mount
  useEffect(() => {
    axios
      .get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=50&page=1&sparkline=false"
      )
      .then((res) => {
        setCoins(res.data);
      }) //storing the crypto data in coins state
      .catch((e) => console.log(e));
  }, []);

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
          />
        );
      })}
    </div>
  );
}

export default App;
