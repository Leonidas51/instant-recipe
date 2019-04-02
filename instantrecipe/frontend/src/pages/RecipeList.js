import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroller';
import SearchArea from "../components/shared/SearchArea/SearchArea";
import Loader from "../components/shared/Loader";
import Recipe from "../components/RecipeList/Recipe";
import "./RecipeList.css";

class RecipeList extends React.Component {
  constructor(props) {
    super(props);

    const ITEMS_ON_PAGE = 10;

    this.state = {
      error: null,
      recipes_loaded: false,
      recipe_list: [],
      ingredient_list: null,
      force_preselect: false,
      shown_recipes: [],
      recipes_on_page: ITEMS_ON_PAGE,
      has_more: false
    };

    this.loadMore = this.loadMore.bind(this);
  }

  componentDidMount() {
    this.fetchRecipes();
    this.setIngsFromURL(this.props.match.params.search);
  }

  componentDidUpdate(prevProps) {
    if(this.state.force_preselect) {
      this.setState({force_preselect: false});
    }

    if(prevProps.match.params.search !== this.props.match.params.search) {
      this.setState({
        recipes_loaded: false,
        shown_recipes: [],
        has_more: false,
      }, () => {
        this.setIngsFromURL(this.props.match.params.search);
        this.fetchRecipes();
      });
    }
  }

  setIngsFromURL(URL_string) {
    let result_ings = [],
        result_ings_ids = [];

    fetch(`/api/ingredient_by_id/${URL_string}`)
      .then(response => {
        response.json()
          .then(result => {
            result_ings = result.map(ing => {
              return {
                id: ing._id,
                name: ing.name
              }
            })

            this.setState({
              ingredient_list: result_ings,
              force_preselect: true
            })
          })
      })
  }

  fetchRecipes() {
    fetch(`/api/recipe_list/${this.props.match.params.search}`)
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Кажется, таких рецептов у нас нет!"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                recipes_loaded: true,
                has_more: true,
                recipe_list: result
              });
            },
            (error) => {
              this.setState({
                recipes_loaded: true,
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

  loadMore() {
    let recipes = this.state.shown_recipes;

    this.state.recipe_list
      .slice(recipes.length, recipes.length + this.state.recipes_on_page)
      .map(recipe => {
        recipes.push(recipe);
    })

    if(recipes.length >= this.state.recipe_list.length) {
      this.setState({has_more: false});
    }

    this.setState({shown_recipes: recipes});
  }

  /* dom events */

  /* end dom events */

  render() {
    const { error, recipes_loaded, recipe_list } = this.state;

    let search_result = (
        <Loader text="Загружаем рецепты..." negative={false} />
    );

    if(error) {
      search_result = <div className="error-message">{error.message}</div>
    } else if(recipes_loaded) {
      search_result = (
        <InfiniteScroll
          pageStart={0}
          loadMore={this.loadMore}
          hasMore={this.state.has_more}
        >

        {
          this.state.shown_recipes.map((recipe, i) => {
            return (
              <div key={recipe._id}>
                <Recipe rec={recipe} ings={this.state.ingredient_list} />
                <hr />
              </div>
            )
          })
        }

        </InfiniteScroll>
      )
    } 

    return(
      <div className="content-area_recipe-list">

        <SearchArea
          showSample={false}
          ingredientList={this.state.ingredient_list}
          forcePreselect={this.state.force_preselect}
        />

        {search_result}

      </div>
    )
  }
}

export default withRouter(RecipeList);
