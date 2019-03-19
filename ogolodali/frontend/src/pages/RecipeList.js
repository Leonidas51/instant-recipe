import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SearchArea from "../components/SearchArea";
import "./Common.css";
import "./RecipeList.css";

class RecipeList extends React.Component {
  constructor(props) {
    super(props);
    const URL_data = this.getIngsFromURL(this.props.match.params.search),
          ITEMS_ON_PAGE = 10;

    this.state = {error: null,
                  is_loaded: false,
                  recipe_list: [],
                  recipes_shown: ITEMS_ON_PAGE,
                  selected_ings: URL_data['selected_ings'],
                  selected_ings_ids: URL_data['selected_ings_ids']};

    this.onLoadMoreClick = this.onLoadMoreClick.bind(this);
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

  /* dom events */

  onLoadMoreClick() {
    const ITEMS_TO_LOAD = 10;

    this.setState((prevState) => {
      return {recipes_shown: prevState.recipes_shown + ITEMS_TO_LOAD};
    })
  }

  /* end dom events */

  render() {
    const { error, is_loaded, recipe_list, selected_ings } = this.state;
    return(
      <div className="content-area_recipe-list">
        <SearchArea 
          showSample={false}
          preselectedIngs={this.state.selected_ings}
        />

        {
          this.state.recipe_list.slice(0, this.state.recipes_shown).map(recipe => {
            return (
              <div key={recipe._id}>
                <Recipe rec={recipe} />
                <hr />
              </div>
            )
          })
        }
        <div onClick={this.onLoadMoreClick}>Load More</div>
      </div>
    )
  }
}

function Recipe(props) {
  const {rec} = props,
        fill = '80';

  let meter_color;

  switch(true) {
    case(fill < 25):
      meter_color = '#DC622D';
      break;
    case(fill >= 25 && fill <= 75):
      meter_color = '#CEC830';
      break;
    case(fill > 75):
      meter_color = '#4EC44B';
      break;
    default:
      meter_color = '#1E2734';
      break;
  }
    

  return (
    <div className="recipe">
      <div className="recipe__pic-container">
        <img className="recipe__pic" src={require(`../images/kuritsa-s-ketchupom/1.png`)} />
      </div>
      <div className="recipe__information">
        <div className="recipe__title">{rec.name}</div>
        <div className="recipe__description">
          {
            rec.instructions_source.length > 300 ?
              rec.instructions_source.slice(0, 300) + '...' :
              rec.instructions_source
          }
        </div>
        <div className="recipe__misc">
          <div className="meter">
            <div className="meter__title">Совпадение:</div>
            <div className="meter__container">
              <div className="meter__fill" style={{width: fill + '%','backgroundColor': meter_color}}></div>
              <div className="meter__value">{fill + '%'}</div>
            </div>
          </div>

          <div className="recipe__time">
            <div className="recipe__time-text">Время:</div>
            <div className="recipe__time-value">{rec.cooking_time}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeList;
