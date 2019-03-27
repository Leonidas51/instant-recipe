import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroller';
import SearchArea from "../components/SearchArea";
import Recipe from "../components/Recipe";
import Loader from "../components/Loader";
import "./RecipeList.css";

class RecipeList extends React.Component {
  constructor(props) {
    super(props);

    const ITEMS_ON_PAGE = 10;

    this.state = {
      error: null,
      recipes_loaded: false,
      recipe_list: [],
      shown_recipes: [],
      recipes_on_page: ITEMS_ON_PAGE,
      has_more: false
    };

    this.loadMore = this.loadMore.bind(this);
  }

  componentDidMount() {
    this.fetchRecipes();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.match.params.search !== this.props.match.params.search) {
      this.setState({
        recipes_loaded: false,
        shown_recipes: [],
        has_more: false
      }, () => {
        this.fetchRecipes();
      });
    }
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
            console.log('error while converting to json: ' + err);
          });
    })
    .catch((err) => {
      console.log('error while fetching: ' + err);
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
                <Recipe rec={recipe} />
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
          preselectedIngs={this.props.match.params.search}
          preselectNeeded={true}
        />

        {search_result}

      </div>
    )
  }
}

export default RecipeList;
