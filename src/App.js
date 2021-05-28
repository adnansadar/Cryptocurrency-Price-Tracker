import React, { useState, useEffect } from "react";
import axios from "axios";
import Coin from "./components/Coin";
import "./Coin.css";
import "./App.css";
import { Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";

import dark from "./assets/images/darkmode.svg";
import light from "./assets/images/lightmode.svg";

export function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("inr");
  const [darkMode, setDarkMode] = useState(true);
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=false`;
  // const ref = useRef();

  // Making an API Call only on mount
  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get(url)
        .then((res) => {
          setCoins(res.data);
        }) //storing the crypto data in coins state
        .catch((e) => console.log(e));
    }, 500);
    return () => clearInterval(interval);
  }, [currency, url]);

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
    <div>
      <div className={darkMode ? "Nav-lightMode" : "Nav-darkMode"}>
        <img
          alt=""
          src={darkMode ? dark : light}
          width="40"
          height="40"
          className="float-right mr-4 mt-3"
          onClick={() => {
            setDarkMode(!darkMode);
          }}
        />

        <div className="coin-search">
          <h1 className=" coin-text">Crypto Price Tracker</h1>
          <form>
            <input
              type="text"
              className="coin-input"
              placeholder="Search"
              onChange={handleChange}
            ></input>
          </form>
        </div>
        <div className="text-center toggle-currency">
          <div>
            {/* <label style={{ "margin-right": "5px" }}>Currency: </label> */}
            {[DropdownButton].map((DropdownType, idx) => (
              <DropdownType
                onSelect={(e) => {
                  setCurrency(e);
                }}
                as={ButtonGroup}
                key={idx}
                id={`dropdown-button-drop-${idx}`}
                size="sm"
                variant="warning"
                title="Currency"
              >
                <Dropdown.Item eventKey="inr">INR</Dropdown.Item>
                <Dropdown.Item eventKey="usd">USD</Dropdown.Item>
                <Dropdown.Item eventKey="eur">EUR</Dropdown.Item>
                <Dropdown.Item eventKey="gbp">GBP</Dropdown.Item>
                <Dropdown.Item eventKey="cad">CAD</Dropdown.Item>
                <Dropdown.Item eventKey="jpy">JPY</Dropdown.Item>
                <Dropdown.Item eventKey="aud">AUD</Dropdown.Item>
                <Dropdown.Item eventKey="chf">CHF</Dropdown.Item>
              </DropdownType>
            ))}
          </div>
          {/* <select
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
        </select> */}
        </div>
      </div>
      {/* {console.log(currency)} */}
      {/* For each filtered coin pass the details to Coin component to display */}
      <div className={darkMode ? "Table-lightMode" : "Table-darkMode"}>
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
    </div>
  );
}

export default App;
