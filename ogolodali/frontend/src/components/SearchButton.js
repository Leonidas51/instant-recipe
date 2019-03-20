import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function SearchButton(props) {
  if (props.selected_ings.length) {
    let selected_ings = props.selected_ings.reduce((accumulated, addition) => {
      return {id: accumulated.id + "&" + addition.id,
              name: accumulated.name + "&" + addition.name};
    });
    return (
      <div
        className={"input-container__search-button input-container__search-button_active"}
      >
        <Link
          className="input-container__search-link"
          to={"/recipes/" + selected_ings.name + "_" + selected_ings.id}
        >
          Найти рецепты
        </Link>
      </div>
    );
  }
  return (
    <div
      className={"input-container__search-button input-container__search-button_inactive"}
    >
      Найти рецепты
    </div>
  );
}

export default SearchButton;
