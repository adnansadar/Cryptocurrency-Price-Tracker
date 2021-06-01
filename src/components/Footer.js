import history from "../history";

import twitter from "../assets/images/twitter.svg";
import email from "../assets/images/email.svg";
import linkedin from "../assets/images/linkedin.svg";
import github from "../assets/images/github.svg";
import "./App.css";

import React from "react";

const Footer = () => {
  return (
    <div className="footer">
      <footer>
        <p>
          <img className="mr-3" alt="" src={twitter} width="30" height="30" />
          <img className="mr-3" alt="" src={email} width="30" height="30" />
          <img
            className="mr-3"
            alt=""
            src={linkedin}
            width="30"
            height="30"
            onClick={(event) =>
              history.push("https://www.linkedin.com/in/adnansadar")
            }
          />
          <img
            className="mr-3"
            alt=""
            src={github}
            width="30"
            height="30"
            onClick={(event) => history.push("https://github.com/adnansadar")}
          />
        </p>
        <p>Copyright &copy; 2021. All rights reserved</p>
      </footer>
    </div>
  );
};

export default Footer;
