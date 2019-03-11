import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class SearchArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="search-area">
        <div className="input-container">
          <input className="input-container__input" type="text" placeholder="Начните вводить названия ингредиентов..." />
          <div className="input-container__search-button input-container__search-button_inactive">Найти рецепты</div>
        </div>
        <div className="search_area__sample">
          Например: <span className="search_area__sample_highlited">брокколи</span>
        </div>
      </div>
    )
  }
}

export default SearchArea;
