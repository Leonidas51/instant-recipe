import React, {Component} from "react";
import "./RadioButton.css";

function RadioButton(props) {
  const class_name = props.negative ?
    'radio-button radio-button_negative' :
    'radio-button';

  return(
    <label className={class_name}>
      {props.text}
      <input name={props.name} type="radio" checked={props.checked} />
      <span className="radio-button__input"></span>
    </label>
  )
}

export default RadioButton;