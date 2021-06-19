import { React } from "react";
import dark from "../assets/images/darkmode.svg";
import light from "../assets/images/lightmode.svg";
import emailNav from "../assets/images/emailNav.png";
import emailNavLight from "../assets/images/emailNavLight.png";
import home from "../assets/images/home.svg";
import homeLight from "../assets/images/homeLight.svg";
import portfolioNav from "../assets/images/portfolioNav.png";
import portfolioNavLight from "../assets/images/portfolioNavLight.png";
import "../App.css";
import { Link } from "react-router-dom";

import { useTheme } from "../context/ThemeProvider";

const Nav = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="nav-buttons">
      <div className="home-button">
        <Link to="/">
          <img
            alt=""
            src={darkMode ? home : homeLight}
            width="40"
            height="40"
            className="mr-4 mt-3  "
          />
        </Link>
      </div>
      {/* <div className="portfolio-button">
        <Link to="/portfolio">
          <img
            alt=""
            src={darkMode ? portfolioNav : portfolioNavLight}
            width="40"
            height="40"
            className="mr-4 mt-3  "
          />
        </Link>
      </div> */}
      <div className="contact-button">
        <Link to="/contact">
          <img
            alt=""
            src={darkMode ? emailNav : emailNavLight}
            width="40"
            height="40"
            className="mr-4 mt-3"
          />
        </Link>
      </div>
      <div className="mode-button">
        <img
          alt=""
          src={darkMode ? light : dark}
          width="40"
          height="40"
          className="mr-4 mt-3"
          onClick={toggleTheme}
        />
      </div>
    </div>
  );
};

export default Nav;
