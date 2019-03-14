import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function getIngsFromURL(URL_string) {
  let selected_ings_arr = URL_string.split('_');
  let selected_ings_names = selected_ings_arr[0].split('&');
  let selected_ings_ids = selected_ings_arr[1].split('&');
  let selected_ings = selected_ings_names.map((ing, index) => {
    return {name: ing, id: selected_ings_ids[index]};
  });
  return {selected_ings: selected_ings, selected_ings_ids: selected_ings_arr[1]};
}

class RecipeList extends React.Component {
  constructor(props) {
    super(props);
    let URL_data = getIngsFromURL(this.props.match.params.search);
    this.state = {error: null,
                  is_loaded: false,
                  recipe_list: [],
                  selected_ings: URL_data['selected_ings'],
                  selected_ings_ids: URL_data['selected_ings_ids']};
  }

  componentDidMount() {
    fetch(`/api/recipe_list/${this.state.selected_ings_ids}`)
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

  onClickGo(e) {
    const self = this;
    fetch(`/api/recipe_list/${test}`)
      .then(function(response) {
        console.log(response);
        if(response.status === 204) {
          self.setState({recipe_list: "Кажется, таких ингредиентов у нас нет!"});
        } else
          response.json()
            .then(function(data) {
              return { status: response.status, body: data };
            })
            .then(function(result) {
              console.log(result);
              self.setState({recipe_list: result.body});
            })
            .catch(function(err) {
              console.log(err);
            });
      })
      .catch(function(err) {
        console.log('something wrong ' + err);
      });
  }

  render() {
    const { error, is_loaded, recipe_list, selected_ings } = this.state;
    if (error) {
      return (<div>Error: {error.message}</div>);
    } else if (!is_loaded) {
      return (<div>Loading...</div>);
    } else {
      return (
        <div>
          Fetching recipes for {selected_ings.map((ing, index) => {
            return <p key={index}>{ing.name}</p>
          })}
          <ul>
          {recipe_list.map((recipe, i) => {
              return <li key={i}>{recipe.name}</li>
          })}
          </ul>
        </div>
      );
    }
  }
}

export default RecipeList;
