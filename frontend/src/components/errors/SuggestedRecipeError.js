import React from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import {get_csrf} from "../../utils";

class SuggestedRecipeError extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      has_error: false,
      error_text: ''
    };

    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { has_error: true };
  }

  componentDidCatch(error, error_info) {
    this.setState({
      error_text: String(error)
    })
  }

  deleteRecipe(recipe_id) {
    get_csrf()
      .then(csrf => {
        fetch('/api/admin/delete_recipe/', {
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
          })
      })
  }

  onDeleteClick(e) {
    if(confirm('Точно удалить?')) {
      this.deleteRecipe(this.props.recipeId);
    }
  }

  render() {
    if (this.state.has_error) {
    return (
      <React.Fragment>
        <p>С рецептом {this.props.recipeId} произошла ошибка</p>
        <p>{this.state.error_text}</p>
        <p><span className="link" onClick={this.onDeleteClick}>Удалить?</span></p>
        <hr />
      </React.Fragment>
    );
    }

    return this.props.children; 
  }
}

export default SuggestedRecipeError;