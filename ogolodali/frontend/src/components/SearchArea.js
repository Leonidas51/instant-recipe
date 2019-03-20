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
      focused_ing: -1,
      suggested_ings: [],
      selected_ings: this.props.preselectedIngs || [],
    }

    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSuggestClick = this.onSuggestClick.bind(this);
    this.onSampleClick = this.onSampleClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onInputKeyPress = this.onInputKeyPress.bind(this);
    this.onSuggestHover = this.onSuggestHover.bind(this);
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

    fetch(`/api/ingredient/${query}`)
      .then(response => {
        return response.json();
      })
      .then(result => {
        self.setState({suggested_ings: result});
      })
      .catch(err => {
        console.log(err);
      })
  }

  addIngredient(ing) {
    if(this.checkDuplicate(ing)) {
      this.setState({
        input_value: '',
        suggested_ings: []
      });
    } else {
      this.setState({
        input_value: '',
        suggested_ings: [],
        selected_ings: [...this.state.selected_ings, ing]
      })
    };
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
    
    this.addIngredient(new_ing);
  }

  onSuggestHover(e) {
    if(this.state.focused_ing !== e.target.dataset.count) {
      this.setState({focused_ing: e.target.dataset.count});
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

  onInputKeyPress(e) {
    const key = e.key;

    let new_ing;

    switch(key) {
      case 'ArrowUp':
        if(this.state.focused_ing > -1) {
          this.setState((prevState) => {
            return {focused_ing: Number(prevState.focused_ing) - 1};
          })
        }
        break;

      case 'ArrowDown':
        if(this.state.focused_ing < this.state.suggested_ings.length - 1) {
          this.setState((prevState) => {
            return {focused_ing: Number(prevState.focused_ing) + 1};
          })
        }
        break;

      case 'Enter':
        if(this.state.suggested_ings[this.state.focused_ing]) {
          new_ing = {
            name: this.state.suggested_ings[this.state.focused_ing].name,
            id: this.state.suggested_ings[this.state.focused_ing]._id
          }

          this.addIngredient(new_ing);
          this.setState({
            focused_ing: -1
          })
        }
        break;

      default:
        return;
    }
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
            onKeyUp={this.onInputKeyPress}
          />

          <SearchButton
            selected_ings={this.state.selected_ings}
            onClick={this.props.onGoClick || {}}
          />

          <div
            className={`input-container__suggestions
            ${this.state.suggested_ings.length ? '' : 'input-container__suggestions_hidden'}`}
          >

            {
              this.state.suggested_ings.map((ing, i) => {
                return (
                  <SuggestedIng
                    key={ing._id}
                    count={i}
                    focused={this.state.focused_ing}
                    ingredient={ing}
                    onClick={this.onSuggestClick}
                    onMouseOver={this.onSuggestHover} /
                  >
                )
              })
            }

          </div>
        </div>

        {
          this.props.showSample ? (
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
            ) : null
        }

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
        <Link 
          className="input-container__search-link"
          to={"/recipes/" + selected_ings.name + "_" + selected_ings.id}
        >
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
        onClick = props.onClick,
        onMouseOver = props.onMouseOver;
  
  let className = 'input-container__suggested-ingredient';

  className += (Number(props.count) === Number(props.focused))
    ? ' input-container__suggested-ingredient_active'
    : '';

  return (
    <div
      data-id={ing._id}
      data-name={ing.name}
      data-count={props.count}
      className={className}
      onClick={onClick}
      onMouseOver={onMouseOver}
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
