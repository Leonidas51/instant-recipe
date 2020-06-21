import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function SelectedIng(props) {
  const ing = props.ingredient,
        onDeleteClick = props.onDeleteClick;

  return (
    <div
      data-id={ing.id}
      className="selected-ingredient"
    >
      <span className="selected-ingredient__name" >{ing.name}</span>
      <span className="selected-ingredient__delete" onClick={onDeleteClick}>✖</span>
    </div>
  )
}

export default SelectedIng;
