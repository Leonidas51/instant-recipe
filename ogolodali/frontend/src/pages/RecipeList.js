import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroller';
import SearchArea from "../components/SearchArea";
import Recipe from "../components/Recipe";
import "./RecipeList.css";

class RecipeList extends React.Component {
  constructor(props) {
    super(props);
    const URL_data = this.getIngsFromURL(this.props.match.params.search),
          ITEMS_ON_PAGE = 10;

    this.state = {error: null,
                  is_loaded: false,
                  recipe_list: [],
                  shown_recipes: [],
                  recipes_on_page: ITEMS_ON_PAGE,
                  has_more: false,
                  selected_ings: URL_data['selected_ings'],
                  selected_ings_ids: URL_data['selected_ings_ids']};

    this.loadMore = this.loadMore.bind(this);
  }

  getIngsFromURL(URL_string) {
    const selected_ings_arr = URL_string.split('_');
    const selected_ings_names = selected_ings_arr[0].split('&');
    const selected_ings_ids = selected_ings_arr[1].split('&');
    const selected_ings = selected_ings_names.map((ing, index) => {
      return {name: ing, id: selected_ings_ids[index]};
    });
    return {selected_ings: selected_ings, selected_ings_ids: selected_ings_arr[1]};
  }

  componentDidMount() {
    this.fetchRecipes();
  }

  componentDidUpdate(prevProps) {
    const URL_data = this.getIngsFromURL(this.props.match.params.search);

    if(prevProps.match.params.search !== this.props.match.params.search) {
      this.setState({
        is_loaded: false,
        shown_recipes: [],
        has_more: false,
        selected_ings: URL_data['selected_ings'],
        selected_ings_ids: URL_data['selected_ings_ids']
      }, () => {
        this.fetchRecipes();
      });
    }
  }

  fetchRecipes() {
    fetch(`/api/recipe_list/${this.state.selected_ings_ids}`)
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Кажется, таких рецептов у нас нет!"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                is_loaded: true,
                has_more: true,
                recipe_list: result
              });
            },
            (error) => {
              this.setState({
                is_loaded: true,
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
    console.log('need more');
    let recipes = this.state.shown_recipes;

    this.state.recipe_list
      .slice(recipes.length, recipes.length + this.state.recipes_on_page)
      .map(recipe => {
        recipes.push(recipe);
    })

    console.log(recipes.length, this.state.recipe_list.length);
    if(recipes.length >= this.state.recipe_list.length) {
      this.setState({has_more: false});
    }

    this.setState({shown_recipes: recipes});
  }

  /* dom events */

  /* end dom events */

  render() {
    const { error, is_loaded, recipe_list, selected_ings } = this.state;

    return(
      <div className="content-area_recipe-list">
        <SearchArea
          showSample={false}
          preselectedIngs={selected_ings}
        />

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
                {
                  (i+1) % 10 === 0 ? (
                  <div>
                    <div>hi i'm an ad</div>
                    <hr />
                  </div>
                  ) : null
                }
              </div>
            )
          })
        }

        </InfiniteScroll>
      </div>
    )
  }
}

export default RecipeList;
