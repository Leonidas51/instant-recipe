import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Ingredient extends React.Component {
  constructor(props) {
    super(props);

    this.state = {ingredient_name: "мо", ingredient_list: []};
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onClickGo = this.onClickGo.bind(this);
  }

  onChangeInput(e) {
    this.setState({ingredient_name: e.target.value});
  }

  onClickGo(e) {
    const self = this;
    fetch(`/api/ingredient/${this.state.ingredient_name}`)
      .then(function(response) {
        console.log(response);
        if(response.status === 204) {
          self.setState({ingredient_list: "Кажется, таких ингредиентов у нас нет!"});
        } else
          response.json()
            .then(function(data) {
              return { status: response.status, body: data };
            })
            .then(function(result) {
              console.log(result);
              self.setState({ingredient_list: result.body});
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
          <span>Get ingredient list #</span>
          <input type="text" onChange={this.onChangeInput} value={this.state.ingredient_name}/>
          <button onClick={this.onClickGo}>Go</button>
        </div>
        <h1>Fetching ingredients (limit 10): {this.state.ingredient_name}</h1>
        <ul>
        {
          this.state.ingredient_list.map(function(ingredient, i){
            return <li key={i}>{ingredient.name}</li>
          })
        }
        </ul>
      </div>
      )
  }
}

export default Ingredient;
