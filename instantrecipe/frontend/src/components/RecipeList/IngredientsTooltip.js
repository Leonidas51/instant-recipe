import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function IngredientsTooltip(props) {
  //`/api/recipe_ings_info/${rec.matches.join('&')}_${rec.recipe_has_but_ingredient_list_doesnt.join('&')}/`
  return (
      <div className="ingredients-tooltip">
        <div className="ingredients-tooltip__hoverable">
          ?
          <div className="ingredients-tooltip__wrap">
            <div className="ingredients-tooltip__container">
              <div className="ingredients-tooltip__section">
                <div className="ingredients-tooltip__section-title">Ингредиенты:</div>
                <div className="ingredients-tooltip__list">

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default IngredientsTooltip;
