import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import UploadRecipePhotoButton from "../components/RecipeDetails/UploadRecipePhotoButton";
import ScrollToTop from "../components/shared/ScrollToTop";
import "./RecipeDetails.css";
import FacebookIcon from "../icons/social/facebook.svg";
import VkIcon from "../icons/social/vk.svg";
import TwitterIcon from "../icons/social/twitter.svg";
import TelgramIcon from "../icons/social/telegram.svg";
import OKIcon from "../icons/social/odnoklassniki.svg";

const difficulty = [
  {text:'элементарно',color:'#4EC44B'},
  {text:'легко',color:'#ADC741'},
  {text:'не так уж и легко',color:'#CEC830'},
  {text:'придется попотеть',color:'#C4A24B'},
  {text:'сложно',color:'#DC622D'},
  {text:'очень сложно',color:'#951010'}
]

class RecipeDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      recipe_loaded: false,
      recipe: {}
    };
  }

  componentDidMount() {
    this.fetchRecipe();
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
              this.parseInstructions(result.instructions_source);
            },
            (error) => {
              this.setState({
                recipe_loaded: true,
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
        backgroundColor: difficulty[this.state.recipe.difficulty - 1].color
      }
    }

    return (
      <div className="content-area content-area_recipe-details">
        <ScrollToTop />
        <div className="recipe-top-container">
          <div className="recipe-pic-container">
          {
            this.state.recipe_loaded ?
            <img className="recipe-pic" src={require(`../images/kuritsa-s-ketchupom-full.jpg`)} />
            : null
          }
            <UploadRecipePhotoButton/>
          </div>
          <div className="recipe-information">
            <div className="recipe-information__title">{ this.state.recipe.name }</div>
            <div className="recipe-information__tags">
              {
                this.state.recipe_loaded ?
                  this.state.recipe.tag_names.map((tag, i) => {
                    if(this.state.recipe.tag_names[i+1]) {
                      return (
                        <span key={this.state.recipe.tag_ids[i]}>
                          <span className="recipe-information__tag-name">{ tag }</span>,&nbsp;
                        </span>
                      )
                    } else {
                      return (
                        <span key={this.state.recipe.tag_ids[i]} className="recipe-information__tag-name">
                          { tag }
                        </span>
                      )
                    }
                  })
                  : null
              }
            </div>
            <div className="recipe-characteristics">
              <div className="recipe-characteristics__item">
                <div className="recipe-characteristics__text">
                  Время:
                </div>
                <div className="recipe-characteristics__value recipe-characteristics__time-value">
                  {
                    this.state.recipe_loaded ?
                    this.state.recipe.cooking_time
                    : null
                  }
                </div>
              </div>
              <div className="recipe-characteristics__item">
                <div className="recipe-characteristics__text">
                  Сложность:
                </div>
                <div style={difficulty_style} className="recipe-characteristics__value recipe-characteristics__difficulty-value">
                  {
                    this.state.recipe_loaded ?
                    difficulty[this.state.recipe.difficulty - 1].text
                    : null
                  }
                </div>
              </div>
              {/*<div className="recipe-characteristics__item">
                <div className="recipe-characteristics__text">
                  Оценка:
                </div>
                <div className="recipe-characteristics__rating-container">
                  <div className="recipe-characteristics__rating-button recipe-characteristics__rating-minus">
                    -
                  </div>
                  <div className="recipe-characteristics__rating-value">
                    {
                      this.state.recipe_loaded ?
                      this.state.recipe.rating
                      : null
                    }
                  </div>
                  <div className="recipe-characteristics__rating-button recipe-characteristics__rating-plus">
                    +
                  </div>
                </div>
              </div>*/}
            </div>
          </div>
        </div>
        <div className="ingredients-container">
          <div className="ingredients__mandatory">
            {
              this.state.recipe_loaded ?
              <p className="ingredients__title">Ингредиенты на {this.parseServes(this.state.recipe.serves)}:</p>
              : null
            }

            <div className="ingredients__list">
              {
                this.state.recipe_loaded ?
                this.state.recipe.ingredient_names.mandatory.map((val, i) => {
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
            this.state.recipe_loaded && this.state.recipe.ingredient_names.optional.length ?
              <div className="ingredients__additional">
                <p className="ingredients__title">Можно добавить:</p>
                <div className="ingredients__list">
                  {
                    this.state.recipe.ingredient_names.optional.map((val, i) => {
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
              this.state.recipe_loaded ?
              this.parseInstructions(this.state.recipe.instructions_source)
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
            <svg className="recipe-share__icon"><use xlinkHref="#vk" /></svg>
            <svg className="recipe-share__icon"><use xlinkHref="#odnoklassniki" /></svg>
            <svg className="recipe-share__icon"><use xlinkHref="#facebook" /></svg>
            <svg className="recipe-share__icon"><use xlinkHref="#twitter" /></svg>
            <svg className="recipe-share__icon"><use xlinkHref="#telegram" /></svg>
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

export default withRouter(RecipeDetails);
