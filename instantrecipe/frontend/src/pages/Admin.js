import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Admin extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area">
        <p>hi i'm an admin page</p>
      </div>
    );
  }
}

export default Admin;