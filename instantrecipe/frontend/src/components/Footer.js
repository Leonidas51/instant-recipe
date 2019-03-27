import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./Footer.css";

class Footer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="footer">
        <hr className="footer__divider" />
        <div className="footer__body">

          <div className="footer__section">
            <div className="footer__title">Мы в соцсетях</div>
            <div className="fotter__social-links"></div>
          </div>

          <div className="footer__section">
            <Link className="footer__link" to="/about">О нас</Link>
            <Link className="footer__link" to="/contacts">Контакты</Link>
            <Link className="footer__link" to="/1">1</Link>
            <Link className="footer__link" to="/2">2</Link>
            <Link className="footer__link" to="/3">3</Link>
          </div>

        </div>
      </div>
    );
  }
}

export default Footer;