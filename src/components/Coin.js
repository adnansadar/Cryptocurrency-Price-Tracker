import React from "react";
import { useState, useEffect } from "react";
import { Spinner, Button } from "react-bootstrap";

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
  // const [userPrice, setUserPrice] = useState(null);
  // const [cryptoValue, setCryptoValue] = useState(null);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setisLoading(false);
    }, 500);
  }, []);

  // destructuring the props passed
  // if coin data is still being fetched conditionally render the spinner
  return isLoading ? (
    <div className="coin-container mb-5">
      <Spinner animation="border" variant="warning" />
    </div>
  ) : (
    <div className="coin-container">
      <div className="coin-row mt-2 ">
        <div className="coin-row-header">
          <img className="coin-logo" src={image} alt="crypto" />
          <h1>{name}</h1>
          <p className="coin-symbol mr-1">{symbol}</p>
          <div className="coin-buttons">
            <Button
              type="submit"
              variant="outline-warning"
              size="sm"
              className="coin-add-button ml-3"
            >
              +
            </Button>
          </div>
          <div className="coin-buttons">
            <Button
              type="submit"
              variant="outline-warning"
              size="sm"
              className="coin-remove-button ml-3"
            >
              -
            </Button>
          </div>

          {/* <div className="userPrice-input input-group input-group-sm ">
            <div className="mt-1 mr-2">{currencysymbol}</div>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              value={userPrice}
              onChange={(e) =>
                e.target.value === "-" ? null : setUserPrice(e.target.value)
              }
            ></input>
          </div>
          <div className="userPrice-input input-group input-group-sm">
            <div className="mt-1 mr-2">{symbol}</div>
            <input
              type="text"
              className="form-control"
              placeholder="0"
              readOnly
              value={
                userPrice === 0 || userPrice == null
                  ? 0
                  : (userPrice / price).toLocaleString()
              }
            ></input>
          </div> */}
        </div>

        <div className="coin-data border-bottom border-warning ">
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
