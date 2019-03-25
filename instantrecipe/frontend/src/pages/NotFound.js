import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class NotFound extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>Not Found!</div>
  }
}

export default NotFound;