import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import SearchButton from "./SearchButton";
import SuggestedIng from "./SuggestedIng";
import SelectedIng from "./SelectedIng";
import {debounce} from "../utils";
import "./SearchArea.css";

class SearchArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      input_value: [],
      focused_ing: -1,
      suggested_ings: [],
      selected_ings: [],
      search_query: null,
      random_ing: {},
    }

    this.input = React.createRef();

    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSuggestClick = this.onSuggestClick.bind(this);
    this.onSampleClick = this.onSampleClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onInputKeyPress = this.onInputKeyPress.bind(this);
    this.onSuggestHover = this.onSuggestHover.bind(this);
    this.fetchSuggestions = debounce(this.fetchSuggestions, 300);
  }

  componentDidMount() {
    if(this.props.preselectedIngs) {
      this.setIngsFromURL(this.props.preselectedIngs);
    }

    if(this.props.showSample) {
      this.fetchRandomIng();
    }
  }

  componentDidUpdate(prevProps) {
    /* берем ингредиенты из урла только если перешли на выдачу */
    /* по прямой ссылке или через browser history */

    if(this.props.preselectedIngs !== prevProps.preselectedIngs) {
      this.setIngsFromURL(this.props.preselectedIngs);
    }
  }

  fetchRandomIng() {
    fetch('/api/random_ingredient/')
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Ингредиенты не найдены"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                random_ing: result
              });
            },
            (error) => {
              this.setState({
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

  prepareQuery(ings) {
    let selected_ings,
        query_obj = {},
        query;

    selected_ings = ings || this.state.selected_ings;

    if (selected_ings.length) {
      let query_obj = selected_ings.reduce((accumulated, addition) => {
        return {id: accumulated.id + "&" + addition.id};
      });

      query = encodeURI(`/recipes/${query_obj.id}`)
    } else {
      query = null;
    }

    return query;
  }

  setIngsFromURL(URL_string) {
    let result_ings = [],
        result_ings_ids = [];

    fetch(`/api/ingredient_by_id/${URL_string}`)
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
                selected_ings: result_ings,
                search_query: this.prepareQuery(result_ings)
              })
          })
      })
  }

  addIngredient(ing) {
    if(this.checkDuplicate(ing)) {
      this.setState({
        input_value: '',
        suggested_ings: [],
        focused_ing: -1
      });
    } else {
      this.setState({
        input_value: '',
        suggested_ings: [],
        selected_ings: [...this.state.selected_ings, ing],
        search_query: this.prepareQuery([...this.state.selected_ings, ing]),
        focused_ing: -1
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
    this.input.current.focus();
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

    this.addIngredient(sample_ing);
  }

  onDeleteClick(e) {
    const del_id = e.target.parentNode.dataset.id;

    let selected_ings;

    selected_ings = this.state.selected_ings.filter((ing) => {
      return ing.id !== del_id;
    })

    this.setState({
      selected_ings: selected_ings,
      search_query: this.prepareQuery(selected_ings)
    });

    this.input.current.focus();
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
        } else if(this.state.input_value.length === 0 && this.state.search_query) {
          this.props.history.push(this.state.search_query);
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
            ref={this.input}
            className="input-container__input"
            type="text"
            placeholder="Начните вводить названия ингредиентов..."
            value={this.state.input_value}
            onChange={this.onChangeInput}
            onKeyUp={this.onInputKeyPress}
          />

          <SearchButton
            query={this.state.search_query}
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

export default withRouter(SearchArea);
