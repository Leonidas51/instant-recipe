import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Loader from "../shared/Loader";
import TwoArrows from "../../icons/two-arrows.svg"

class IngredientsTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading_started: false,
      ings_loaded: false,
      matched_ings: [],
      missing_ings: [],
      all_ings: []
    };

    this.onIconHover = this.onIconHover.bind(this);
  }

  fetchRecipeInfo() {
    let matches_str = this.props.rec.matches.join('&');
    let recipe_has_but_ingredient_list_doesnt_str =
      this.props.rec.recipe_has_but_ingredient_list_doesnt.join('&');
    let url_str = matches_str + '_' + recipe_has_but_ingredient_list_doesnt_str;
    fetch(`/api/recipe_ings_info/${url_str}/`)
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Что-то пошло не так"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                ings_loaded: true,
                matched_ings: result.user_has_ings,
                missing_ings: result.user_doesnt_have_ings
              });
            },
            (error) => {
              this.setState({
                ings_loaded: true,
                error: error
              });
            }
          )
          .catch((err) => {
            console.error('error while converting to json: ' + err);
          });
    })
    .catch((err) => {
      console.error('error while fetching: ' + err);
    });
  }

  /* dom events */

  onIconHover(e) {
    if(this.state.loading_started) {
      return;
    }

    this.setState({
      loading_started: true
    })

    if(this.props.need_match) {
      this.fetchRecipeInfo();
      return;
    }

    this.setState({
      all_ings: this.props.rec.ingredient_names.mandatory,
      ings_loaded: true
    });
  }

  /* end dom events */

  render() {
    let matched,
        missing,
        full,
        ings_list;

    if(this.state.ings_loaded) {
      if(this.props.need_match) {
        matched = this.state.matched_ings ?
          this.state.matched_ings.map(ing => {
            return(
              <div 
                key={ing._id}
                className="ingredients-tooltip__ing ingredients-tooltip__ing_included_true"
              >
                ✓ {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
              </div>
            )
          })
          : null

        missing = this.state.missing_ings ?
          this.state.missing_ings.map(ing => {
            return(
              <div
                key={ing._id}
                className="ingredients-tooltip__ing ingredients-tooltip__ing_included_false"
              >
                ✗ {ing.name.charAt(0).toUpperCase() + ing.name.slice(1)}
              </div>
            )
          })
          : null
      } else {
        full = Object.keys(this.state.all_ings).map((key, i) => {
              return(
                <div
                  key={i}
                  className="ingredients-tooltip__ing ingredients-tooltip__ing_no-match"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
              )
        });
      }
    }

    if(this.props.need_match) {
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
          <div className="ingredients-tooltip__hoverable" onMouseOver={this.onIconHover}>
            <svg className="ingredients-tooltip__arrows">
                <use xlinkHref="#two-arrows" />
            </svg>
            <div className="ingredients-tooltip__wrap">
              <div className="ingredients-tooltip__container">
                <div className="ingredients-tooltip__section">
                    {
                      this.state.ings_loaded ? 
                        ings_list
                        : <Loader />
                    }
                </div>
              </div>
            </div>
          </div>
        </div>
      )
  }
}

export default IngredientsTooltip;
