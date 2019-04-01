import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class IngredientsTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      ings_loaded: false,
      user_has_ings: [],
      user_doesnt_have_ings: [],
    };
  }

  componentDidMount() {
    this.fetchRecipeInfo();
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
                recipes_loaded: true,
                user_has_ings: result.user_has_ings,
                user_doesnt_have_ings: result.user_doesnt_have_ings
              });
              console.log(this.state.user_has_ings);
              console.log(this.state.user_doesnt_have_ings);
            },
            (error) => {
              this.setState({
                recipes_loaded: true,
                error: error
              });
            }
          )
          .catch((err) => {
            console.log('error while converting to json: ' + err);
          });
    })
    .catch((err) => {
      console.log('error while fetching: ' + err);
    });
  }

  render() {
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
}

export default IngredientsTooltip;
