import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SearchArea from "../components/SearchArea";
import "./Common.css";
import "./Index.css";

class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area_index">
        <div className="content-area_index__logo">
          Проголодались?
        </div>
        <SearchArea />
      </div>
    )
  }
}

export default Index;