import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SuggestedRecipe from "../../components/admin/SuggestedRecipe";
import SuggestedRecipeError from "../../components/errors/SuggestedRecipeError";
import "./SuggestedRecipes.css";
import "../RecipeDetails.css";

class SuggestedRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipes: [],
      recipes_loaded: false
    };
  }

  componentWillMount() {
    this.fetchRecipes();
  }

  fetchRecipes() {
    fetch('/api/admin/get_suggested_recipes')
      .then(response => {
        if(response.status === 200) {
          response.json()
            .then(result => {
              result.recipes.forEach(recipe => {
                this.setIngredientEntries(recipe);
              });

              this.setState({
                recipes: result.recipes,
                recipes_loaded: true
              });
            })
        }
      })
  }

  setIngredientEntries(recipe) {
    recipe.ingredient_names.mandatory = Object.entries(recipe.ingredient_names.mandatory);
    recipe.ingredient_names.optional = Object.entries(recipe.ingredient_names.optional);
  }

  render() {
    return (
      <div className="content-area">
        {
          this.state.recipes.length ?
          this.state.recipes.map(recipe => {
            return (
              <SuggestedRecipeError key={recipe._id} recipeId={recipe._id} >
                <SuggestedRecipe recipe={recipe} fetchRecipes={this.fetchRecipes.bind(this)} />
              </SuggestedRecipeError>
            )
          })
          : <div>Здесь пока пусто...</div>
        }
      </div>
    );
  }
}

export default SuggestedRecipes;