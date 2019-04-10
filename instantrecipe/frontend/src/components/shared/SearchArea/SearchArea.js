import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import SearchButton from "./SearchButton";
import SuggestedIng from "./SuggestedIng";
import SelectedIng from "./SelectedIng";
import SortOption from "./SortOption";
import {debounce} from "../../../utils";
import "./SearchArea.css";

class SearchArea extends React.Component {
  constructor(props) {
    super(props);

    const sort = this.props.cookies.get('by_ing_sort') || '';

    this.state = {
      error: null,
      input_value: [],
      focused_ing: -1,
      suggested_ings: [],
      selected_ings: [],
      search_query: null,
      random_ing: {},
      preselect_required: true,
      sort_selection_shown: false,
      selected_sort: sort,
      selected_sort_text: this.parseSort(sort),
      sort_hint_text: ''
    }

    this.input = React.createRef();

    this.onWindowClick = this.onWindowClick.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSuggestClick = this.onSuggestClick.bind(this);
    this.onSampleClick = this.onSampleClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onInputKeyPress = this.onInputKeyPress.bind(this);
    this.onSuggestHover = this.onSuggestHover.bind(this);
    this.fetchSuggestions = debounce(this.fetchSuggestions, 300);
    this.onSortTypeClick = this.onSortTypeClick.bind(this);
    this.onSortTypeHover = this.onSortTypeHover.bind(this);
    this.onSortClick = this.onSortClick.bind(this);
  }

  componentDidMount() {
    if(this.props.showSample) {
      this.fetchRandomIng();
    }

    window.addEventListener('click', this.onWindowClick);
  }

  componentDidUpdate(prevProps) {
    if(this.props.ingredientList && this.state.preselect_required) {
      this.setState({
        selected_ings: this.props.ingredientList,
        preselect_required: false
      })
    }
  }

  static getDerivedStateFromProps(nextProps) {
    return {
      preselect_required: nextProps.forcePreselect
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
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
            console.error('error while converting to json: ' + err);
          });
    })
    .catch((err) => {
      console.error('error while fetching: ' + err);
    });
  }

  fetchSuggestions(query) {
    fetch(`/api/ingredient/${query}`)
      .then(response => {
        return response.json();
      })
      .then(result => {
        this.setState({suggested_ings: result});
      })
      .catch(err => {
        console.error(err);
      })
  }

  prepareQuery(ings, sort) {
    let selected_ings,
        selected_sort = sort || '',
        query_obj = {},
        query;

    selected_ings = ings || this.state.selected_ings;

    if (selected_ings.length) {
      let query_obj = selected_ings.reduce((accumulated, addition) => {
        return {id: accumulated.id + "&" + addition.id};
      });

      query = encodeURI(`/recipes/${query_obj.id}/${selected_sort}`);
    } else {
      query = null;
    }

    return query;
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
        search_query: this.prepareQuery([...this.state.selected_ings, ing], this.state.selected_sort),
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

  closeSort() {
    this.setState({
      sort_hint_text: '',
      sort_selection_shown: false
    });
  }

  parseSort(sort_type) {
    switch (sort_type) {
      case 'min-expense':
        return 'минимальным тратам';
      case 'full-match':
        return 'максимальному совпадению';
      case 'timeasc':
        return 'времени (по возрастанию)';
      case 'timedesc':
        return 'времени (по убыванию)';
      case '':
        return 'минимальным тратам';
    }
  }

  /* dom events */

  onWindowClick(e) {
    this.closeSort();
  }

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
      search_query: this.prepareQuery(selected_ings, this.state.selected_sort)
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

  onSortClick(e) {
    e.stopPropagation();

    if(this.state.sort_selection_shown) {
      this.closeSort();
    } else {
      this.setState({sort_selection_shown: true});
    }
  }

  onSortTypeClick(e) {
    this.setState({
      selected_sort: e.target.dataset.sortType,
      selected_sort_text: e.target.innerHTML,
      search_query: this.prepareQuery(this.state.selected_ings, e.target.dataset.sortType)
    }, () => {
      this.props.cookies.set('by_ing_sort', this.state.selected_sort);
      this.props.history.push(this.state.search_query);
    })
  }

  onSortTypeHover(e) {
    switch(e.target.dataset.sortType) {
      case 'min-expense':
        this.setState({sort_hint_text: 'Подберем рецепты с наименьшим количеством недостающих ингредиентов. Идеально для тех, кто совсем не хочет идти в магазин.'});
        break;
      case 'full-match':
        this.setState({sort_hint_text: 'Подберем рецепты, в которых  присутствует максимальное количество ингредиентов из выбранных.'});
        break;
      default:
        this.setState({sort_hint_text: ''});
    }
  }

  /* end dom events */

  render() {
    let sort_hint = this.state.sort_hint_text ? (
      <div className="search-settings__sort-tip">
        {this.state.sort_hint_text}
      </div>
    ) : null

    return(
      <div className="search-area">
        <div className="input-container">
          <input
            ref={this.input}
            className="input-container__input"
            type="text"
            placeholder="Поиск по ингредиентам"
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
        
        {
          this.props.showSettings ? (
            <div className="search-settings">
              <div className="search-settings__sort">
                <span className="search-settings__sort-text">Сортировать по: </span>
                <div className="search-settings__sort-select" onClick={this.onSortClick}>
                  <div className="search-settings__sort-selected">
                    {this.state.selected_sort_text}
                    <div className="search-settings__sort-triangle"></div>
                  </div>

                  <div 
                    className="search-settings__sort-tooltip"
                    style={{display: this.state.sort_selection_shown ? 'block' : 'none'}}
                  >
                    <div className="search-settings__sort-selection">
                      <SortOption type="min-expense" text="минимальным тратам" onHover={this.onSortTypeHover} onClick={this.onSortTypeClick} />
                      <SortOption type="full-match" text="максимальному совпадению" onHover={this.onSortTypeHover} onClick={this.onSortTypeClick} />
                      <SortOption type="timeasc" text="времени (по возрастанию)" onHover={this.onSortTypeHover} onClick={this.onSortTypeClick} />
                      <SortOption type="timedesc" text="времени (по убыванию)" onHover={this.onSortTypeHover} onClick={this.onSortTypeClick} />
                    
                    </div>

                    {sort_hint}
                  </div>

                </div>
              </div>
            </div>
          ) : null
        }

      </div>
    )
  }
}

export default withRouter(SearchArea);
