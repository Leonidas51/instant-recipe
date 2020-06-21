import React from "react";
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
            <div className="footer__link-container">
              {
                this.props.isLoggedIn
                ? <Link to="/suggest_recipe" className="footer__link">Предложить рецепт</Link>
                : <Link to="/" className="footer__link" onClick={this.props.openAuth}>Предложить рецепт</Link>
              }
            </div>
            <div className="footer__link-container"><Link className="footer__link" to="/contacts">Контакты</Link></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;