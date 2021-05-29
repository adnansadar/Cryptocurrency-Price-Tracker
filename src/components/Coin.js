import React from "react";
import { useState } from "react";

const Coin = ({
  name,
  image,
  symbol,
  price,
  volume,
  priceChange,
  marketCap,
  currencysymbol,
}) => {
  const [counter, setCounter] = useState(0);
  // destructuring the props passed
  return (
    <div className="coin-container">
      <div className="mt-2 coin-row">
        <div className=" coin">
          <img className="coin-img" src={image} alt="crypto" />
          <h1>{name}</h1>
          <p className="coin-symbol mr-1">{symbol}</p>
          <button
            onClick={(e) => setCounter(counter + 1)}
            className="ml-4 counter-button btn-sm btn-primary "
          >
            +
          </button>

          <button
            onClick={(e) => (counter === 0 ? null : setCounter(counter - 1))}
            className="counter-button btn-sm btn-primary ml-2 "
          >
            -
          </button>

          <div className="counter-input input-group input-group-sm ml-3">
            <input
              type="text"
              className="form-control"
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
              value={counter}
              readOnly
            ></input>
          </div>
        </div>
        <div className=" border-bottom border-warning coin-data">
          {/* toLocaleString used for formatting the figure */}
          <p className="coin-price">
            Price: {currencysymbol}
            {price.toLocaleString()}
          </p>
          <p className="coin-volume">
            Volume: {currencysymbol}
            {volume.toLocaleString()}
          </p>
          {priceChange < 0 ? (
            <p className="coin-percent red">{priceChange.toFixed(2)}%</p>
          ) : (
            <p className="coin-percent green">{priceChange.toFixed(2)}%</p>
          )}
          <p className="coin-marketcap">
            Market Cap: {currencysymbol}
            {marketCap.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Coin;
