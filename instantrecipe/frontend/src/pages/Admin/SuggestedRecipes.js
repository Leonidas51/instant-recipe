import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./SuggestedRecipes.css";
import "../RecipeDetails.css";
import {get_csrf} from "../../utils";

const difficulty = [
  {text:'элементарно',color:'#4EC44B'},
  {text:'легко',color:'#ADC741'},
  {text:'не так уж и легко',color:'#CEC830'},
  {text:'придется попотеть',color:'#C4A24B'},
  {text:'сложно',color:'#DC622D'},
  {text:'очень сложно',color:'#951010'}
]

class SuggestedRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipes: [],
      recipes_loaded: false
    };

    this.onPublishClick = this.onPublishClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  componentWillMount() {
    this.fetchRecipes();
  }

  fetchRecipes() {
    fetch('/api/admin/get_unpublished_recipes')
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

  parseServes(serves) {
    let serves_word;

    if(serves === 1) {
      serves_word = 'порцию';
    } else if(serves > 1 && serves < 5) {
      serves_word = 'порции';
    } else {
      serves_word = 'порций';
    }

    return `${serves} ${serves_word}`;
  }

  parseInstructions(text) {
    return text.split('\n').map((step,i) => {
      return <div className="recipe-instructions__step" key={i}>{step}</div>
    })
  }

  setIngredientEntries(recipe) {
    recipe.ingredient_names.mandatory = Object.entries(recipe.ingredient_names.mandatory);
    recipe.ingredient_names.optional = Object.entries(recipe.ingredient_names.optional);
  }

  publishRecipe(recipe_id) {
    get_csrf()
      .then(csrf => {
        fetch('/api/admin/publish_recipe', {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrf,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipe_id: recipe_id
          })
        })
          .then(response => {
            if(response.status === 200) {
              alert('Успешно!');
            } else {
              alert('Ошибка сервера');
            }

            this.fetchRecipes();
          })
      })
  }

  deleteRecipe(recipe_id) {
    get_csrf()
      .then(csrf => {
        fetch('/api/admin/delete_recipe', {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrf,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipe_id: recipe_id
          })
        })
          .then(response => {
            if(response.status === 200) {
              alert('Успешно!');
            } else {
              alert('Ошибка сервера');
            }

            this.fetchRecipes();
          })
      })
  }

  onPublishClick(e) {
    if(confirm('Точно опубликовать?')) {
      this.publishRecipe(e.target.dataset.recipe_id);
    }
  }

  onDeleteClick(e) {
    if(confirm('Точно удалить?')) {
      this.deleteRecipe(e.target.dataset.recipe_id);
    }
  }

  render() {
    return (
      <div className="content-area">
        {
          this.state.recipes.map(recipe => {
            return(
            <React.Fragment key={recipe._id}>
              <div className="recipe-top-container">
                <div className="recipe-pic-container">
                {
                  this.state.recipes_loaded
                  ? <img className="recipe-pic" src={`/images/recipes/upload/${recipe._id}/1.jpg`} />
                  : null
                }
                </div>
                <div className="recipe-information">
                  <div className="recipe-information__title">{ recipe.name }</div>
                  <div className="recipe-information__tags"></div>
                  <div className="recipe-characteristics">
                    <div className="recipe-characteristics__item">
                      <div className="recipe-characteristics__text">
                        Время:
                      </div>
                      <div className="recipe-characteristics__value recipe-characteristics__time-value">
                        {
                          this.state.recipes_loaded ?
                          recipe.cooking_time
                          : null
                        }
                      </div>
                    </div>
                    <div className="recipe-characteristics__item">
                      <div className="recipe-characteristics__text">
                        Сложность:
                      </div>
                      <div className="recipe-characteristics__value recipe-characteristics__difficulty-value">
                        {
                          this.state.recipes_loaded ?
                          difficulty[recipe.difficulty - 1].text
                          : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ingredients-container">
                <div className="ingredients__mandatory">
                  {
                    this.state.recipes_loaded ?
                    <p className="ingredients__title">Ингредиенты на {this.parseServes(recipe.serves)}:</p>
                    : null
                  }

                  <div className="ingredients__list">
                    {
                      this.state.recipes_loaded ?
                      recipe.ingredient_names.mandatory.map((val, i) => {
                        return (
                          <p key={i}>
                            {i + 1}. {val[0]} {val[1]}
                          </p>
                        )
                      })
                      : null
                    }
                  </div>
                </div>
                {
                  this.state.recipes_loaded && recipe.ingredient_names.optional.length ?
                    <div className="ingredients__additional">
                      <p className="ingredients__title">Можно добавить:</p>
                      <div className="ingredients__list">
                        {
                          recipe.ingredient_names.optional.map((val, i) => {
                            return (
                              <p key={i}>{i + 1}. {val[0]} {val[1]}</p>
                            );
                          })
                        }
                      </div>
                    </div>
                    : null
                }
              </div>
              <div className="recipe-instructions">
                <div className="section-title">Инструкции</div>
                <div className="recipe-instructions__list">
                  {
                    this.state.recipes_loaded ?
                    this.parseInstructions(recipe.instructions_source)
                    : null
                  }
                </div>
              </div>
              <div className="recipe-source">
                <p>
                {
                  this.state.recipes_loaded ?
                  recipe.author.length ? "Источник: " + recipe.author : ""
                  : null
                }
                </p>
              </div>
              <div className="suggested-recipes__buttons">
                <div onClick={this.onDeleteClick} data-recipe_id={recipe._id} className="suggested-recipes__button suggested-recipes__delete">Удалить</div>
                <div className="suggested-recipes__open-editor link">Открыть в редакторе</div>
                <div onClick={this.onPublishClick} data-recipe_id={recipe._id} className="suggested-recipes__button suggested-recipes__publish">Опубликовать</div>
              </div>
              <hr />
            </React.Fragment>
            )
          })
        }
      </div>
    );
  }
}

export default SuggestedRecipes;