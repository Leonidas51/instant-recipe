import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";

class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>О нас - Рецепт Быстрого Приготовления</title>
        </Helmet>
        <div className="content-area">About!</div>
      </React.Fragment>
    )
  }
}

export default About;