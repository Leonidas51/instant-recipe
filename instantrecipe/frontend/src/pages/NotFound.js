import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./NotFound.css";

class NotFound extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <div className="content-area content-area_not-found">
      <h2 className="error__title">404</h2>
      <p className="error__description">Страница не найдена!</p>
    </div>);
  }
}

export default NotFound;
