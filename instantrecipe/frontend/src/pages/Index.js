import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SearchArea from "../components/shared/SearchArea/SearchArea";
import FeaturedRecipes from "../components/Index/FeaturedRecipes";
import "./Index.css";

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
        <div className="highlighted-text">
          <div className="highlighted-text__title">Добро пожаловать!</div>
          <div className="highlighted-text__body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
        </div>
      </div>
    )
  }
}

export default Index;