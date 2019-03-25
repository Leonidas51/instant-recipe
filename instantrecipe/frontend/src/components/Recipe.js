import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
//import "../pages/RecipeList.css";


function Recipe(props) {
  const {rec} = props;
  const fill = rec.matches_percent;

  let meter_color;

  switch(true) {
    case(fill < 25):
      meter_color = '#DC622D';
      break;
    case(fill >= 25 && fill <= 75):
      meter_color = '#CEC830';
      break;
    case(fill > 75):
      meter_color = '#4EC44B';
      break;
    default:
      meter_color = '#1E2734';
      break;
  }


  return (
    <div className="recipe">
      <div className="recipe__pic-container">
        <img className="recipe__pic" src={require(`../images/kuritsa-s-ketchupom/1.png`)} />
      </div>
      <div className="recipe__information">
        <div className="recipe__title">{rec.name}</div>
        <div className="recipe__description">
          {
            rec.instructions_source.length > 300 ?
              rec.instructions_source.slice(0, 300) + '...' :
              rec.instructions_source
          }
        </div>
        <div className="recipe__misc">
          <div className="meter">
            <div className="meter__title">Совпадение:</div>
            <div className="meter__container">
              <div className="meter__fill" style={{width: fill + '%','backgroundColor': meter_color}}></div>
              <div className="meter__value">{fill + '%'}</div>
            </div>
          </div>

          <div className="recipe__time">
            <div className="recipe__time-text">Время:</div>
            <div className="recipe__time-value">{rec.cooking_time}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recipe;