import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";

class PasswordRestoration extends React.Component {
  constructor(props) {
    super(props);
    this.restorePassword = this.restorePassword.bind(this);
  }

  restorePassword(e) {
    console.log('pifffff');
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>О нас - Рецепт Быстрого Приготовления</title>
        </Helmet>
        <div>Страница где нужно ввести новый пароль</div>
      </React.Fragment>
    )
  }
}

export default PasswordRestoration;
