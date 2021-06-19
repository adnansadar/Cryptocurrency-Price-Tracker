import React, { useContext, useState, useEffect } from "react";
import axios from "axios";

const CoinDataContext = React.createContext();

export function useCoinData() {
  return useContext(CoinDataContext);
}

export function CoinDataProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [currency, setCurrency] = useState("inr");
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value); //value entered in the search box stored in search state
  };

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=false`;

  // Making an API Call only on mount
  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get(url)
        .then((res) => {
          setCoins(res.data);
        }) //storing the crypto data in coins state
        .catch((e) => console.log(e));
    }, 400);
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
  return (
    <CoinDataContext.Provider
      value={{
        coins,
        currency,
        setCurrency,
        search,
        setSearch,
        handleSearch,
        dictionary,
      }}
    >
      {children}
    </CoinDataContext.Provider>
  );
}
