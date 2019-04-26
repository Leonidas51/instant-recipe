import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./NotFound.css";

class NotFound extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>404 - Рецепт Быстрого Приготовления</title>
        </Helmet>

        <div className="content-area content-area_not-found">
          <h2 className="error__title">404</h2>
          <p className="error__description">Страница не найдена!</p>
        </div>
      </React.Fragment>
    );
  }
}

export default NotFound;
