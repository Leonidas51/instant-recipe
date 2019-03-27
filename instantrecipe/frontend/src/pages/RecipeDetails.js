import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import DownloadRecipePhotoButton from "../components/DownloadRecipePhotoButton"
import "./RecipeDetails.css";


class RecipeDetails extends React.Component {
  constructor(props) {
    super(props);

    this.difficulty = {
      1: "элементарно",
      2: "легко",
      3: "не так уж и легко",
      4: "придется попотеть",
      5: "сложно",
      6: "очень сложно"
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
      console.log(response);
      if(response.status === 204) {
        this.setState({error: {message: "Кажется, таких рецептов у нас нет!"}});
      } else
        response.json()
          .then(
            (result) => {
              console.log(result);
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

  render() {
    const { error, recipe_loaded, recipe } = this.state;

    let search_result = <div className="loading">loading...</div>;

    if(error) {
      search_result = <div className="error-message">{ error.message }</div>
    } else if(recipe_loaded) {
    }

    return (
      <div className="content-area_recipe-details">
        <div className="recipe-top-container">
          <div className="recipe-pic-container">
            <img className="recipe-pic" src={require(`../images/kuritsa-s-ketchupom-full.jpg`)} />
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
                  { this.state.recipe.cooking_time }
                </div>
              </div>
              <div className="recipe-information__characteristics__item">
                <div className="recipe-information__characteristics__text">
                  Сложность:
                </div>
                <div className="recipe-information__characteristics__value recipe-information__characteristics__difficulty-value">
                  { this.difficulty[this.state.recipe.difficulty] }
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
                    { this.state.recipe.rating }
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
            <p className="ingredients__title">Ингредиенты на { this.state.recipe.serves } порции:</p>
            <div className="ingredients__list">
              {
                /*this.state.recipe.ingredient_names.mandatory.map((val, i) => {
                  return (<p>{i + 1}. {val[0]} {val[1]}</p>);
                })*/
              }
            </div>
          </div>
          <div className="ingredients__additional">
            <p className="ingredients__title">Можно добавить:</p>
            <div className="ingredients__list">
              {
                /*this.state.recipe.ingredient_names.optional.map((val, i) => {
                  return (<p>{i + 1}. {val[0]} {val[1]}</p>);
                })*/
              }
            </div>
          </div>
        </div>
        <div className="recipe-instructions">
          <div className="section-title">Инструкции</div>
          <div className="recipe-instructions__list ">
            { this.state.recipe.instructions_source }
          </div>
        </div>
        <div className="recipe-source">
          <p>
          { /*this.state.recipe.author.length ? "Источник: " + this.state.recipe.author : ""*/ }
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
