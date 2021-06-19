// import React, { useState, useEffect } from "react";
// import "../App.css";

// import { useTheme } from "../context/ThemeProvider";
// import { useCoinData } from "../context/CoinDataProvider";

// import Nav from "./Nav";
// import Footer from "./Footer";

// const Portfolio = ({
//   name,
//   image,
//   symbol,
//   price,
//   marketCap,
//   priceChange,
//   volume,
//   currencysymbol,
// }) => {
//   const { coins, setCoins } = useCoinData();
//   const { currency, setCurrency } = useCoinData();
//   const { darkMode, toggleTheme } = useTheme();
//   const [userPrice, setUserPrice] = useState(null);

//   const dictionary = {
//     inr: "₹",
//     usd: "$",
//     eur: "€",
//     gbp: "£",
//     cad: "$",
//     jpy: "¥",
//     aud: "$",
//     chf: "₣",
//   };

//   useEffect(() => {}, [name]);
//   return (
//     <div>
//       <div className={darkMode ? " header-darkMode" : "header-lightMode"}>
//         <Nav darkMode onClick={toggleTheme} />
//         {name === undefined ? (
//           ""
//         ) : (
//           <div className="coin-container">
//             <div className="coin-row mt-2 ">
//               <div className="coin-row-header">
//                 <img className="coin-logo" src={image} alt="crypto" />
//                 <h1>{name}</h1>
//                 <p className="coin-symbol mr-1">{symbol}</p>
//               </div>

//               <div className="coin-data border-bottom border-warning ">
//                 {/* toLocaleString used for formatting the figure */}
//                 <p className="coin-price">
//                   Price: {currencysymbol}
//                   {price.toLocaleString()}
//                 </p>
//                 <p className="coin-volume">
//                   Volume: {currencysymbol}
//                   {volume.toLocaleString()}
//                 </p>
//                 {priceChange < 0 ? (
//                   <p className="coin-percent red">{priceChange.toFixed(2)}%</p>
//                 ) : (
//                   <p className="coin-percent green">
//                     {priceChange.toFixed(2)}%
//                   </p>
//                 )}
//                 <p className="coin-marketcap">
//                   Market Cap: {currencysymbol}
//                   {marketCap.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* <div className="userPrice-input input-group input-group-sm ">
//           <div className="mt-1 mr-2">{currencysymbol}</div>
//           <input
//             type="number"
//             className="form-control"
//             placeholder="0"
//             value={userPrice}
//             onChange={(e) =>
//               e.target.value === "-" ? null : setUserPrice(e.target.value)
//             }
//           ></input>
//         </div>
//         <div className="userPrice-input input-group input-group-sm">
//           <div className="mt-1 mr-2">{symbol}</div>
//           <input
//             type="text"
//             className="form-control"
//             placeholder="0"
//             readOnly
//             value={
//               userPrice === 0 || userPrice == null
//                 ? 0
//                 : (userPrice / price).toLocaleString()
//             }
//           ></input>
//         </div> */}
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default Portfolio;
