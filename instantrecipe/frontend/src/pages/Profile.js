import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Redirect to="/indev" />
      </React.Fragment>
    )
  }
}

export default Profile;