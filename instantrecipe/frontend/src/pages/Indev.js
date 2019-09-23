import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";
import "./Indev.css";
import IndevPic from "../images/indev.jpg";

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area">
        <div className="indev-text__head">Страница находится в разработке!</div>
        <div className="indev-text"></div>
        <div className="indev-pic">
          <img src={IndevPic} />
        </div>
      </div>
    )
  }
}

export default Profile;