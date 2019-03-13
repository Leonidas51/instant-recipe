import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Ingredient extends React.Component {
  constructor(props) {
    super(props);

    this.state = {recipe_list: []};
    this.onClickGo = this.onClickGo.bind(this);
  }

  onClickGo(e) {
    const self = this;
    let test = 'babaaba';
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
    return (
      <div>
        <div>
          <span>Get recipes list #</span>
          <button onClick={this.onClickGo}>Go</button>
        </div>
        <h1>Fetching recipes for картошка, моркошка и лук</h1>
        <ul>
        {
          this.state.recipe_list.map(function(recipe, i){
            return <li key={i}>{recipe.name}</li>
          })
        }
        </ul>
      </div>
      )
  }
}
export default Ingredient;
