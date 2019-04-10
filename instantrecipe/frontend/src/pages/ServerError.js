import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./ServerError.css";

class ServerError extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <div className="content-area content-area_not-found">
      <h2 className="error__title">500</h2>
      <p className="error__description">Ошибка на сервере!</p>
    </div>);
  }
}

export default ServerError;
