import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function SearchButton(props) {
  if (props.query) {
    return (
      <div
        className={"input-container__search-button input-container__search-button_active"}
      >
        <Link
          className="input-container__search-link"
          to={props.query}
        >
          Найти рецепты
        </Link>
      </div>
    );
  } else {
    return (
      <div
        className={"input-container__search-button input-container__search-button_inactive"}
      >
        Найти рецепты
      </div>
    );
  }
}


export default SearchButton;
