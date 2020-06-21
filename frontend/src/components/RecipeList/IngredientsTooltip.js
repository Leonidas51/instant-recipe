import React from "react";
import TwoArrows from "../../icons/two-arrows.svg"

function IngredientsTooltip(props) {
  let matched = [],
      missing = [],
      full,
      ings_list;

  if(props.need_match && props.items) {
    matched = props.rec.ings_mandatory.filter(ing => {
      let match = false;

      props.items.forEach(search_ing => {
        if(ing.id === search_ing.id) {
          match = true;
        }
      })

      if(match) {
        return true;
      }

      missing.push(ing);
      return false;
    })
      .map(ing => {
        return(
          <div 
            key={ing.id}
            className="ingredients-tooltip__ing ingredients-tooltip__ing_included_true"
          >
            ✓ {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
          </div>
        )
      })

    missing = missing.map(ing => {
      return(
          <div
            key={ing.id}
            className="ingredients-tooltip__ing ingredients-tooltip__ing_included_false"
          >
            ✗ {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
          </div>
      )
    })
  } else {
    full = props.rec.ings_mandatory.map(ing => {
      return(
        <div
            key={ing.id}
            className="ingredients-tooltip__ing ingredients-tooltip__ing_no-match"
          >
            {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
          </div>
      )
    })
  }
  
  if(props.need_match) {
    ings_list = (
      <div className="ingredients-tooltip__list">
        {matched}
        {missing}
      </div>
    )
  } else {
    ings_list = (
      <div className="ingredients-tooltip__list">
        {full}
      </div>
    )
  }

  return (
      <div className="ingredients-tooltip">
      <span className="ingredients-tooltip__text">Ингредиенты:</span>
        <div className="ingredients-tooltip__hoverable">
          <svg className="ingredients-tooltip__arrows">
              <use xlinkHref="#two-arrows" />
          </svg>
          <div className="ingredients-tooltip__wrap">
            <div className="ingredients-tooltip__container">
              <div className="ingredients-tooltip__section">
                {ings_list}
              </div>
            </div>
          </div>
        </div>
      </div>
    )

}

export default IngredientsTooltip;
