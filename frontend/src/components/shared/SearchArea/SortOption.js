import React, {Component} from "react";

function SortOption(props) {
  return (
    <div
      onClick={props.onClick}
      onMouseOver={props.onHover}
      data-sort-type={props.type}
      className="search-settings__sort-option"
    >
      {props.text}
    </div>
  )
}

export default SortOption;