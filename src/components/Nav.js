import { React, useState } from "react";
import dark from "../assets/images/darkmode.svg";
import light from "../assets/images/lightmode.svg";
import emailNav from "../assets/images/emailNav.png";
import home from "../assets/images/home.svg";
import "./App.css";
import { Link } from "react-router-dom";

const Nav = ({ onClick }) => {
  const [darkModeIcon, setDarkModeIcon] = useState(true);
  const handleClick = () => {
    onClick(onClick);
    setDarkModeIcon(!darkModeIcon);
  };
  return (
    <div className="nav-buttons">
      <div>
        <Link to="/">
          <img
            alt=""
            src={home}
            width="40"
            height="40"
            className="mr-4 mt-3  "
          />
        </Link>
      </div>
      <div className="portfolio-button">
        <Link to="/contact">
          <img
            alt=""
            src={emailNav}
            width="40"
            height="40"
            className="mr-4 mt-3"
            //   onClick={<NavLink to="/contact" exact></NavLink>}
          />
        </Link>
      </div>
      <div className="mode-button">
        <img
          alt=""
          src={darkModeIcon ? light : dark}
          width="40"
          height="40"
          className="mr-4 mt-3"
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default Nav;
