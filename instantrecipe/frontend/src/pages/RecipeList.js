import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
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
      search_items: null,
      search_string: '',
      force_preselect: false,
      shown_recipes: [],
      recipes_on_page: ITEMS_ON_PAGE,
      has_more: false
    };

    this.loadMore = this.loadMore.bind(this);
  }

  componentDidMount() {
    this.fetchRecipes();
    this.setFromUrl(this.props.match.params.search, this.props.match.params.type);
  }

  componentDidUpdate(prevProps) {
    if(this.state.force_preselect) {
      this.setState({force_preselect: false});
    }

    if(prevProps.match.params.search !== this.props.match.params.search ||
      prevProps.match.params.sort !== this.props.match.params.sort) {
      this.setState({
        recipes_loaded: false,
        shown_recipes: [],
        has_more: false,
        search_items: null,
        search_string: ''
      }, () => {
        this.setFromUrl(this.props.match.params.search, this.props.match.params.type);
        this.fetchRecipes();
      });
    }
  }

  setFromUrl(url, type) {
    switch(type) {
      case 'by_ings':
        this._setIngsFromUrl(url);
        break;
      case 'by_name':
        this._setNameFromUrl(url);
        break;
      case 'by_tags':
        this._setTagsFromUrl(url);
        break;
    }
  }

  _setIngsFromUrl(url) {
    let result_ings = [];

    fetch(`/api/ingredient_by_id/${url}`)
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
              search_items: result_ings,
              force_preselect: true
            })
          })
      })
  }

  _setNameFromUrl(url) {
    this.setState({
      search_string: decodeURIComponent(url),
      force_preselect: true
    });
  }

  _setTagsFromUrl(url) {
    let result_tags = [];

    fetch(`/api/tag_by_id/${url}`)
      .then(response => {
        response.json()
          .then(result => {
            result_tags = result.map(tag => {
              return {
                id: tag._id,
                name: tag.name
              }
            })

            this.setState({
              search_items: result_tags,
              force_preselect: true
            })
          })
          .catch((err) => {
            console.error('error while converting to json: ' + err);
          })
      })
  }

  fetchRecipes() {
    fetch(`/api/recipe_list/${this.props.match.params.type}/${decodeURIComponent(this.props.match.params.search)}/${this.props.match.params.sort}`)
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Кажется, таких рецептов у нас нет!"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                error: null,
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
    const { error, recipes_loaded, recipe_list } = this.state,
          need_match = this.props.match.params.type === 'by_ings';

    let search_result = (
        <Loader text="Загружаем рецепты..." negative={false} />
    );

    if(error) {
      search_result = <div className="recipe-list__error-message">{error.message}</div>
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
                <Recipe rec={recipe} need_match={need_match} />
                <hr />
              </div>
            )
          })
        }

        </InfiniteScroll>
      )
    }

    return(
      <React.Fragment>
        <Helmet>
          <title>Поиск - Рецепт Быстрого Приготовления</title>
        </Helmet>

        <div className="content-area content-area_recipe-list">

          <SearchArea
            cookies={this.props.cookies}
            showSample={false}
            showSettings={true}
            searchItems={this.state.search_items}
            searchString={this.state.search_string}
            selectedSort={this.props.match.params.sort}
            forcePreselect={this.state.force_preselect}
          />

          {search_result}

        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(RecipeList);
