import React from "react";
import SortOption from "./SortOption";

function SortSelection(props) {
  let sort_hint = props.sortHintText ? (
    <div className="search-settings__sort-tip">
      {props.sortHintText}
    </div>
  ) : null

  return (
    <div className="search-settings__sort">
      <span className="search-settings__sort-text">Сортировать по: </span>
      <div className="search-settings__sort-select" onClick={props.onSortClick}>
        <div className="search-settings__sort-selected">
          {props.selectedSortText}
          <div className="search-settings__sort-triangle"></div>
        </div>

        <div 
          className="search-settings__sort-tooltip"
          style={{display: props.sortSelectionShown ? 'block' : 'none'}}
        >
          <div className="search-settings__sort-selection">
            {
              props.searchByIngs ?
                <div>
                  <SortOption type="min-expense" text="минимальным тратам" onHover={props.onSortTypeHover} onClick={props.onSortTypeClick} />
                  <SortOption type="full-match" text="максимальному совпадению" onHover={props.onSortTypeHover} onClick={props.onSortTypeClick} />
                </div>
              : null
            }
            <SortOption type="timeasc" text="времени (по возрастанию)" onHover={props.onSortTypeHover} onClick={props.onSortTypeClick} />
            <SortOption type="timedesc" text="времени (по убыванию)" onHover={props.onSortTypeHover} onClick={props.onSortTypeClick} />
          </div>

          {sort_hint}
        </div>
    </div>
  </div>
  )
}

export default SortSelection;