import React from "react";
import { useState, useEffect } from "react";
import { Spinner, Button } from "react-bootstrap";
import Portfolio from "./Portfolio";

const handleRemoveClick = () => {};

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
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setisLoading(false);
    }, 500);
  }, []);

  const handleAddClick = () => {
    <Portfolio
      name={name}
      image={image}
      symbol={symbol}
      price={price}
      marketCap={marketCap}
      priceChange={priceChange}
      volume={volume}
      currencysymbol={currencysymbol}
    />;
  };

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
              className="coin-add-button ml-3"
              type="submit"
              variant="outline-warning"
              size="sm"
              onClick={handleAddClick}
            >
              +
            </Button>
          </div>
          <div className="coin-buttons">
            <Button
              className="coin-remove-button ml-3"
              type="submit"
              variant="outline-warning"
              size="sm"
              onClick={handleRemoveClick}
            >
              -
            </Button>
          </div>
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
