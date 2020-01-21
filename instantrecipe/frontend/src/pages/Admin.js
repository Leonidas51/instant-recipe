import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Admin extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area">
        <Link className="link" to="/admin/suggested_images">Предложенные фотографии</Link>
      </div>
    );
  }
}

export default Admin;