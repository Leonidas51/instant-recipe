import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {get_csrf} from "../../utils";

const difficulty = [
  {text:'элементарно',color:'#4EC44B'},
  {text:'легко',color:'#ADC741'},
  {text:'не так уж и легко',color:'#CEC830'},
  {text:'придется попотеть',color:'#C4A24B'},
  {text:'сложно',color:'#DC622D'},
  {text:'очень сложно',color:'#951010'}
]

class SuggestedRecipe extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      has_error: false,
      error_text: ''
    }

    this.onPublishClick = this.onPublishClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onImageDeleteClick = this.onImageDeleteClick.bind(this);
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

            this.props.fetchRecipes();
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

            this.props.fetchRecipes();
          })
      })
  }

  deleteImage(recipe_id) {
    get_csrf()
      .then(csrf => {
        fetch('/api/admin/delete_image', {
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
            } else if(response.status === 400) {
              alert('Изображение не найдено');
            } else {
              alert('Ошибка сервера');
            }

            this.props.fetchRecipes();
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

  onImageDeleteClick(e) {
    if(confirm('Удалить фото?')) {
      this.deleteImage(e.target.dataset.recipe_id);
    }
  }

  render() {
    const recipe = this.props.recipe;

    if(this.state.has_error) {
      return(
        <React.Fragment>
          {this.state.error_text}
        </React.Fragment>
      )
    }

    return (
    <React.Fragment>
      <div className="recipe-top-container">
        <div className="recipe-pic-container">
          <img className="recipe-pic" src={`/images/recipes/upload/${recipe._id}/1.jpg`} />
        <div className="recipe-pic-delete-button" data-recipe_id={recipe._id} onClick={this.onImageDeleteClick}>
          Удалить фото
        </div>
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
                  {recipe.cooking_time}
              </div>
            </div>
            <div className="recipe-characteristics__item">
              <div className="recipe-characteristics__text">
                Сложность:
              </div>
              <div className="recipe-characteristics__value recipe-characteristics__difficulty-value">
                {difficulty[recipe.difficulty - 1].text}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ingredients-container">
        <div className="ingredients__mandatory">
          <p className="ingredients__title">Ингредиенты на {this.parseServes(recipe.serves)}:</p>
          <div className="ingredients__list">
            {
              recipe.ingredient_names.mandatory.map((val, i) => {
                return (
                  <p key={i}>
                    {i + 1}. {val[0]} {val[1]}
                  </p>
                )
              })
            }
          </div>
        </div>
        {
          recipe.ingredient_names.optional.length 
          ? (<div className="ingredients__additional">
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
            </div>)
            : null
        }
      </div>
      <div className="recipe-instructions">
        <div className="section-title">Инструкции</div>
        <div className="recipe-instructions__list">
          {this.parseInstructions(recipe.instructions_source)}
        </div>
      </div>
      <div className="recipe-source">
        <p>
        {recipe.author.length ? "Источник: " + recipe.author : ""}
        </p>
      </div>
      <div className="suggested-recipes__buttons">
        <div onClick={this.onDeleteClick} data-recipe_id={recipe._id} className="suggested-recipes__button suggested-recipes__delete">Удалить</div>
        <Link className="suggested-recipes__open-editor link" to={`/admin/recipe_editor/${recipe._id}`} target="_blank">Открыть в редакторе</Link>
        <div onClick={this.onPublishClick} data-recipe_id={recipe._id} className="suggested-recipes__button suggested-recipes__publish">Опубликовать</div>
      </div>
      <hr />
    </React.Fragment>
    )
  }
}

export default SuggestedRecipe;