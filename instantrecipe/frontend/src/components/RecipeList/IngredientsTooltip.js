import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Loader from "../shared/Loader";

class IngredientsTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading_started: false,
      ings_loaded: false,
      matched_ings: [],
      missing_ings: [],
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

    this.fetchRecipeInfo();
  }

  /* end dom events */

  render() {
    let matched_list,
        missing_list;

    if(this.state.ings_loaded) {
      matched_list = this.state.matched_ings ?
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

      missing_list = this.state.missing_ings ?
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
    }

    return (
        <div className="ingredients-tooltip">
          <div className="ingredients-tooltip__hoverable" onMouseOver={this.onIconHover}>
            ?
            <div className="ingredients-tooltip__wrap">
              <div className="ingredients-tooltip__container">
                <div className="ingredients-tooltip__section">
                  <div className="ingredients-tooltip__section-title">Ингредиенты:</div>
                    {
                      this.state.ings_loaded ? 
                        <div className="ingredients-tooltip__list">
                          {matched_list}
                          {missing_list}
                        </div>
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
