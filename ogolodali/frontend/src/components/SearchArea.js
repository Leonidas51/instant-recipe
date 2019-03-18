import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class SearchArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      is_loaded: false,
      random_ing: "",
      input_value: [],
      suggested_ings: [],
      selected_ings: [],
    }

    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSuggestClick = this.onSuggestClick.bind(this);
    this.onSampleClick = this.onSampleClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  componentDidMount() {
    fetch('/api/random_ingredient/')
      .then((response) => {
        if(response.status === 204) {
          this.setState({error: {message: "Ингредиенты не найдены"}});
        } else
          response.json()
            .then(
              (result) => {
                this.setState({
                  is_loaded: true,
                  random_ing: result
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

  fetchSuggestions(query) {
    const self = this;

    fetch(`api/ingredient/${query}`)
      .then(response => {
        return response.json();
      })
      .then(result => {
        self.setState({suggested_ings: result});
      })
  }

  checkDuplicate(ing) {
    if(this.state.selected_ings.find(element => {
      return element.id === ing.id;
    })) {
      return true;
    }

    return false;
  }

  /* dom events */

  onChangeInput(e) {
    this.setState({input_value: e.target.value});

    if(!e.target.value) {
      this.setState({suggested_ings: []});
      return;
    }

    this.fetchSuggestions(e.target.value);
  }

  onSuggestClick(e) {
    const new_ing = {
      name: e.target.dataset.name,
      id: e.target.dataset.id
    };

    if(this.checkDuplicate(new_ing)) {
      this.setState({
        input_value: '',
        suggested_ings: []
      });
    } else {
      this.setState({
        input_value: '',
        suggested_ings: [],
        selected_ings: [...this.state.selected_ings, new_ing]
      });
    }
  }

  onSampleClick(e) {
    const sample_ing = {
      name: e.target.dataset.name,
      id: e.target.dataset.id
    };

    if(this.checkDuplicate(sample_ing)) {
      return;
    }

    this.setState({
      selected_ings: [...this.state.selected_ings, sample_ing]
    });
  }

  onDeleteClick(e) {
    const del_id = e.target.parentNode.dataset.id;

    this.setState({
      selected_ings: this.state.selected_ings.filter((ing) => {
        return ing.id !== del_id;
      })
    });
  }

  /* end dom events */

  render() {
    return(
      <div className="search-area">
        <div className="input-container">
          <input
            className="input-container__input"
            type="text"
            placeholder="Начните вводить названия ингредиентов..."
            value={this.state.input_value}
            onChange={this.onChangeInput}
          />

          <SearchButton selected_ings={this.state.selected_ings} />

          <div
            className={`input-container__suggestions
            ${this.state.suggested_ings.length ? '' : 'input-container__suggestions_hidden'}`}
          >

            {
              this.state.suggested_ings.map((ing, i) => {
                return <SuggestedIng key={ing._id} ingredient={ing} onClick={this.onSuggestClick} />
              })
            }

          </div>
        </div>
        <div className="search_area__sample">
          <span>Например: </span>
          <span
            className="search_area__sample_highlited"
            data-id={this.state.random_ing._id}
            data-name={this.state.random_ing.name}
            onClick={this.onSampleClick}
          >
            {this.state.random_ing.name}
          </span>
        </div>
        <div className="search_area__selected-ings">
          {
            this.state.selected_ings.map((ing, i) => {
                return <SelectedIng key={ing.id} ingredient={ing} onDeleteClick={this.onDeleteClick} />
            })
          }
        </div>
      </div>
    )
  }
}

function SearchButton(props) {
  if (props.selected_ings.length) {
    let selected_ings = props.selected_ings.reduce((accumulated, addition) => {
      return {id: accumulated.id + "&" + addition.id,
              name: accumulated.name + "&" + addition.name};
    });
    return (
      <div
        className={"input-container__search-button input-container__search-button_active"}
      >
        <Link className="input-container__search-link" to={"/recipes/" + selected_ings.name + "_" + selected_ings.id}>
          Найти рецепты
        </Link>
      </div>
    );
  }
  return (
    <div
      className={"input-container__search-button input-container__search-button_inactive"}
    >
      Найти рецепты
    </div>
  );
}

function SuggestedIng(props) {
  const ing = props.ingredient,
        onClick = props.onClick;

  return (
    <div
      data-id={ing.id}
      data-name={ing.name}
      className="input-container__suggested-ingredient"
      onClick={onClick}
    >
    {ing.name}
    </div>
  )
}

function SelectedIng(props) {
  const ing = props.ingredient,
        onDeleteClick = props.onDeleteClick;

  return (
    <div
      data-id={ing.id}
      className="selected-ingredient"
    >
      <span className="selected-ingredient__name" >{ing.name}</span>
      <span className="selected-ingredient__delete" onClick={onDeleteClick}>✖</span>
    </div>
  )
}

export default SearchArea;
