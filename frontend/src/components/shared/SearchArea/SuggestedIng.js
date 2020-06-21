import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function SuggestedIng(props) {
  const ing = props.ingredient,
        onClick = props.onClick,
        onMouseOver = props.onMouseOver;

  let className = 'input-container__suggested-ingredient';

  className += (Number(props.count) === Number(props.focused))
    ? ' input-container__suggested-ingredient_active'
    : '';

  return (
    <div
      data-id={ing._id}
      data-name={ing.name}
      data-count={props.count}
      className={className}
      onClick={onClick}
      onMouseOver={onMouseOver}
    >
    {ing.name}
    </div>
  )
}

export default SuggestedIng;
