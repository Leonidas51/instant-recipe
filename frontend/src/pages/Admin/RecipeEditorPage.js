import React from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import RecipeEditor from "../../components/shared/RecipeEditor";
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

    this.onSearchFocus = this.onSearchFocus.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  componentDidMount() {
    if(this.state.search_query.length) {
      this.search();
    }
  }

  search() {
    this.setState({
      recipe_loaded: false
    })

    fetch(`/api/recipe_all/${this.state.search_query}/`)
    .then((response) => {
      if(response.status === 200) {
        response.json()
          .then(result => {
              const recipe = {};
              recipe.recipe_name = result.name;
              ['_id', 'cooking_time_min', 'cooking_time_max', 'serves', 'difficulty', 'tags', 'featured', 'published']
                .forEach(prop => {
                  recipe[prop] = result[prop];
                });
              recipe.ings = result.ings_mandatory;
              recipe.opt_ings = result.ings_optional;

              recipe.steps = this.parseInstructions(result.instructions_source)

              this.setState({
                recipe_loaded: true,
                recipe: recipe,
                error: ''
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

  parseInstructions(text) {
    let result = text.split('\n');
    result = result.map(step => {
        return step.split('.').slice(1).join('.').trim();
    });

    return result;
  }

  onSearchChange(e) {
    this.setState({search_query: e.target.value});
  }

  onSearchFocus(e) {
    this.setState({search_query: ''});
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
            <input className="recipe-editor-page__search-input" type="text" value={this.state.search_query} onChange={this.onSearchChange} onFocus={this.onSearchFocus} placeholder="ID рецепта" />
            <input className="recipe-editor-page__search-go-btn" type="submit" value="GO" />
          </form>
          {
            this.state.recipe && this.state.recipe_loaded
            ? <RecipeEditor recipe={this.state.recipe} isAdmin={true} />
            : null
          }
          {
            this.state.error
            ? <div className="error">{this.state.error}</div>
            : null
          }
        </div>
      </div>
    )
  }
}

export default withRouter(RecipeEditorPage);