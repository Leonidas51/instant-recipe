import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import {get_csrf} from '../../utils';
import "./RecipeEditorPage.css";

class RecipeEditorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search_query: this.props.match.params.recipe_id || '',
      recipe: {},
      recipe_loaded: false,
      error: ''
    }

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  componentDidMount() {
    if(this.state.search_query.length) {
      this.search();
    }
  }

  search() {
    fetch(`/api/recipe_all/${this.state.search_query}/`)
    .then((response) => {
      if(response.status === 200) {
        response.json()
          .then(result => {
              const recipe = {};
              recipe.recipe_name = result.name;
              ['cooking_time_min', 'cooking_time_max', 'serves', 'difficulty']
                .forEach(prop => {
                  recipe[prop] = result[prop];
                });
              //recipe.ings = this.parseIngredients(result.ingredient_names.mandatory);

              this.setState({
                recipe_loaded: true,
                recipe: recipe
              });
            }
          )
        } else if(response.status === 204) {
          this.setState({error: 'Кажется, такого рецепта у нас нет!'});
        } else {
          this.setState({error: 'Произошла ошибка сервера'});
        }
    })
  }

  parseIngredients(ings) {
    console.log(JSON.stringify(ings));
  }

  parseInstructions(text) {

  }

  onSearchChange(e) {
    this.setState({search_query: e.target.value});
  }

  onSearchSubmit(e) {
    e.preventDefault();
    this.search();
  }

  render() {
    return (
      <div className="content-area">
        <div className="recipe-editor-page__search">
          <form onSubmit={this.onSearchSubmit}>
            <input className="recipe-editor-page__search-input" type="text" value={this.state.search_query} onChange={this.onSearchChange} placeholder="ID рецепта" />
            <input className="recipe-editor-page__search-go-btn" type="submit" value="GO" />
          </form>
        </div>
      </div>
    )
  }
}

export default withRouter(RecipeEditorPage);