import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import DownloadRecipePhotoButton from "../components/DownloadRecipePhotoButton"
import "./RecipeDetails.css";


class RecipeDetails extends React.Component {
  constructor(props) {
    super(props);

    this.difficulty = {
      1: ["элементарно", "#4EC44B"],
      2: ["легко", "#ADC741"],
      3: ["не так уж и легко", "#CEC830"],
      4: ["придется попотеть", "#C4A24B"],
      5: ["сложно", "#DC622D"],
      6: ["очень сложно", "#951010"]
    }

    this.state = {
      error: null,
      recipe_loaded: false,
      recipe: {}
    };
  }

  componentDidMount() {
    this.fetchRecipe();
  }

  fetchRecipe() {
    fetch(`/api/recipe/${this.props.match.params.details}/`)
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Кажется, такого рецепта у нас нет!"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setIngredientEntries(result);
              this.setState({
                recipe_loaded: true,
                recipe: result
              });
            },
            (error) => {
              this.setState({
                recipe_loaded: true,
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

  setIngredientEntries(recipe) {
    recipe.ingredient_names.mandatory = Object.entries(recipe.ingredient_names.mandatory);
    recipe.ingredient_names.optional = Object.entries(recipe.ingredient_names.optional);
  }

  render() {
    const { error, recipe_loaded, recipe } = this.state;

    let search_result = <div className="loading">loading...</div>;
    let difficulty_style = {};

    if(error) {
      search_result = <div className="error-message">{ error.message }</div>
    } else if(recipe_loaded) {
      difficulty_style = {
        backgroundColor: this.difficulty[this.state.recipe.difficulty][1]
      }
    }

    return (
      <div className="content-area_recipe-details">
        <div className="recipe-top-container">
          <div className="recipe-pic-container">
          {
            this.state.recipe_loaded ?
            <img className="recipe-pic" src={require(`../images/kuritsa-s-ketchupom-full.jpg`)} />
            : null
          }
            <DownloadRecipePhotoButton/>
          </div>
          <div className="recipe-information-container">
            <div className="recipe-information__title">{ this.state.recipe.name }</div>
            <div className="recipe-information__tags">
              {
                this.state.recipe_loaded ?
                  this.state.recipe.tag_names.map((tag, i) => {
                    if(this.state.recipe.tag_names[i+1]) {
                      return <span><span className="recipe-information__tags__name">{ tag }</span>,&nbsp;</span>
                    } else {
                      return <span className="recipe-information__tags__name">{ tag }</span>
                    }
                  })
                  : null
              }
            </div>
            <div className="recipe-information__characteristics">
              <div className="recipe-information__characteristics__item">
                <div className="recipe-information__characteristics__text">
                  Время:
                </div>
                <div className="recipe-information__characteristics__value recipe-information__characteristics__time-value">
                  {
                    this.state.recipe_loaded ?
                    this.state.recipe.cooking_time
                    : null
                  }
                </div>
              </div>
              <div className="recipe-information__characteristics__item">
                <div className="recipe-information__characteristics__text">
                  Сложность:
                </div>
                <div style={difficulty_style} className="recipe-information__characteristics__value recipe-information__characteristics__difficulty-value">
                  {
                    this.state.recipe_loaded ?
                    this.difficulty[this.state.recipe.difficulty][0]
                    : null
                  }
                </div>
              </div>
              <div className="recipe-information__characteristics__item">
                <div className="recipe-information__characteristics__text">
                  Оценка:
                </div>
                <div className="recipe-information__characteristics__rating-container">
                  <div className="recipe-information__characteristics__rating-button recipe-information__characteristics__rating-minus">
                    -
                  </div>
                  <div className="recipe-information__characteristics__rating-value">
                    {
                      this.state.recipe_loaded ?
                      this.state.recipe.rating
                      : null
                    }
                  </div>
                  <div className="recipe-information__characteristics__rating-button recipe-information__characteristics__rating-plus">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="ingredients-container">
          <div className="ingredients__mandatory">
            <p className="ingredients__title">Ингредиенты на {
              this.state.recipe_loaded ? this.state.recipe.serves : null } порции:</p>
            <div className="ingredients__list">
              {
                this.state.recipe_loaded ?
                this.state.recipe.ingredient_names.mandatory.map((val, i) => {
                  return (<p>{i + 1}. {val[0]} {val[1]}</p>);
                })
                : null
              }
            </div>
          </div>
          <div className="ingredients__additional">
            <p className="ingredients__title">Можно добавить:</p>
            <div className="ingredients__list">
              {
                this.state.recipe_loaded ?
                this.state.recipe.ingredient_names.optional.map((val, i) => {
                  return (<p>{i + 1}. {val[0]} {val[1]}</p>);
                })
                : null
              }
            </div>
          </div>
        </div>
        <div className="recipe-instructions">
          <div className="section-title">Инструкции</div>
          <div className="recipe-instructions__list ">
            {
              this.state.recipe_loaded ?
              this.state.recipe.instructions_source
              : null
            }
          </div>
        </div>
        <div className="recipe-source">
          <p>
          {
            this.state.recipe_loaded ?
            this.state.recipe.author.length ? "Источник: " + this.state.recipe.author : ""
            : null
          }
          </p>
        </div>
        <div className="recipe-share">
          <p>Поделиться: </p>
          <div className="recipe-share__list">
            вконтактик, фейсбукк, энстаграм
          </div>
        </div>
        <div className="comment-section">
          <div className="section-title">
            Комментарии
            <div className="comment-section__content">
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RecipeDetails;
