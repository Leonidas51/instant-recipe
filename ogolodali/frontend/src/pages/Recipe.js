import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Recipe extends React.Component {
  constructor(props) {
    super(props);

    this.state = {recipe_id: 2, recipe_text: ''};
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onClickGo = this.onClickGo.bind(this);
  }
  
  onChangeInput(e) {
    this.setState({recipe_id: e.target.value});
  }

  onClickGo(e) {
    const self = this;

    fetch(`/api/recipe/${this.state.recipe_id}`)
    .then(function(response) {
      console.log(response);
      if(response.status === 204) {
        self.setState({recipe_text: "Кажется, такого рецепта у нас нет!"});
      } else
        response.json()
          .then(function(data) {
            return { status: response.status, body: data };
          })
          .then(function(result) {
            console.log(result);
            self.setState({recipe_text: result.body.instructions_source});
          })
          .catch(function(err) {
            console.log(err);
          });
    });

  }

  render() {
    return (
      <div>
        <div>
          <span>Get recipe #</span>
          <input type="text" onChange={this.onChangeInput} value={this.state.recipe_id}/>
          <button onClick={this.onClickGo}>Go</button>
        </div>
        <h1>Fetching recipe: {this.state.recipe_id}</h1>
        <div>
          {this.state.recipe_text}
        </div>
      </div>
      )
  }
}

export default Recipe;