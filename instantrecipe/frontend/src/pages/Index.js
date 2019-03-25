import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SearchArea from "../components/SearchArea";
import "./Index.css";
import FeaturedRecipes from "../components/FeaturedRecipes";

class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area_index">
        <div className="content-area_index__logo">
          Рецепт Быстрого Приготовления
        </div>
        <SearchArea showSample={true} />
        <FeaturedRecipes />
      </div>
    )
  }
}

export default Index;