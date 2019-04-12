import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import SearchButton from "./SearchButton";
import SuggestedIng from "./SuggestedIng";
import SelectedIng from "./SelectedIng";
import SortSelection from "./SortSelection";
import RadioButton from "../RadioButton";
import {debounce, is_touch_screen} from "../../../utils";
import "./SearchArea.css";
import TwoArrows from "../../../icons/two-arrows.svg"

class SearchArea extends React.Component {
  constructor(props) {
    super(props);

    const sort = this.props.cookies.get('by_ing_sort') || this.props.match.params.sort || 'min-expense';

    this.props.cookies.set('by_ing_sort', sort, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});

    this.state = {
      error: null,
      mode: 'by_ings',
      input_value: [],
      suggestions: [],
      focused_suggestion: -1,
      selected_ings: [],
      search_query: null,
      random_ing: {},
      preselect_required: true,
      sort_selection_shown: false,
      selected_sort: sort,
      highlighted_sort: null,
      selected_sort_text: this.parseSort(sort),
      sort_hint_text: ''
    }

    this.input = React.createRef();
    this.bindEvents();
  }

  componentDidMount() {
    if(this.props.showSample) {
      this.fetchRandomIng();
    }

    window.addEventListener('click', this.onWindowClick);
  }

  componentDidUpdate(prevProps) {
    if(this.state.preselect_required && this.props.ingredientList) {
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

  bindEvents() {
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
    this.onSortTypeTap = this.onSortTypeTap.bind(this);
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
        this.setState({suggestions: result});
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

      query = encodeURI(`/recipes/${this.state.mode}/${query_obj.id}/${selected_sort}`);
    } else {
      query = null;
    }

    return query;
  }

  addIngredient(ing) {
    if(this.checkDuplicate(ing)) {
      this.setState({
        input_value: '',
        suggestions: [],
        focused_suggestion: -1
      });
    } else {
      this.setState({
        input_value: '',
        suggestions: [],
        selected_ings: [...this.state.selected_ings, ing],
        search_query: this.prepareQuery([...this.state.selected_ings, ing], this.state.selected_sort),
        focused_suggestion: -1
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
      sort_selection_shown: false,
      highlighted_sort: null
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

  setSortHint(type) {
    switch(type) {
      case 'min-expense':
        return 'Подберем рецепты с наименьшим количеством недостающих ингредиентов. Идеально для тех, кто совсем не хочет идти в магазин.';
      case 'full-match':
        return 'Подберем рецепты, в которых присутствует максимальное количество ингредиентов из выбранных.';
      default:
        return '';
    }
  }

  /* dom events */

  onWindowClick(e) {
    this.closeSort();
  }

  onChangeInput(e) {
    this.setState({input_value: e.target.value});

    if(!e.target.value) {
      this.setState({suggestions: []});
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
    if(this.state.focused_suggestion !== e.target.dataset.count) {
      this.setState({focused_suggestion: e.target.dataset.count});
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
        if(this.state.focused_suggestion > -1) {
          this.setState((prevState) => {
            return {focused_suggestion: Number(prevState.focused_suggestion) - 1};
          })
        }
        break;

      case 'ArrowDown':
        if(this.state.focused_suggestion < this.state.suggestions.length - 1) {
          this.setState((prevState) => {
            return {focused_suggestion: Number(prevState.focused_suggestion) + 1};
          })
        }
        break;

      case 'Enter':
        if(this.state.suggestions[this.state.focused_suggestion]) {
          new_ing = {
            name: this.state.suggestions[this.state.focused_suggestion].name,
            id: this.state.suggestions[this.state.focused_suggestion]._id
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

  onSortTypeTap(e) {
    e.stopPropagation();

    const hint = this.setSortHint(e.target.dataset.sortType)

    if(this.state.highlighted_sort === e.target.dataset.sortType || !hint) {
      this.onSortTypeClick(e);
    } else {
      this.setState({
        highlighted_sort: e.target.dataset.sortType,
        sort_hint_text: hint
      })
    }
  }

  onSortTypeClick(e) {
    this.closeSort();

    this.setState({
      selected_sort: e.target.dataset.sortType,
      selected_sort_text: e.target.innerHTML,
      search_query: this.prepareQuery(this.state.selected_ings, e.target.dataset.sortType)
    }, () => {
      this.props.cookies.set('by_ing_sort', this.state.selected_sort, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});
      this.props.history.push(this.state.search_query);
    })
  }

  onSortTypeHover(e) {
    this.setState({
      sort_hint_text: this.setSortHint(e.target.dataset.sortType)
    })
  }

  /* end dom events */

  render() {
    const is_touch = is_touch_screen();

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
            ${this.state.suggestions.length ? '' : 'input-container__suggestions_hidden'}`}
          >

            {
              this.state.suggestions.map((ing, i) => {
                return (
                  <SuggestedIng
                    key={ing._id}
                    count={i}
                    focused={this.state.focused_suggestion}
                    ingredient={ing}
                    onClick={this.onSuggestClick}
                    onMouseOver={this.onSuggestHover} /
                  >
                )
              })
            }

          </div>

          <div className="search-types">
            <div className="search-types__selection">
              <RadioButton text="По ингредиентам" name="search-type" checked={true} negative={true} />
              <RadioButton text="По названию" name="search-type" checked={false} negative={true} />
              <RadioButton text="По тегам" name="search-type" checked={false} negative={true} />
            </div>
            <div className="search-types__divider"></div>
            <div className="search-types__bottom">
              <svg className="search-types__arrows">
                <use xlinkHref="#two-arrows" />
              </svg>
            </div>
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
              <SortSelection
                onSortClick = {this.onSortClick}
                onSortTypeHover = {is_touch ? null : this.onSortTypeHover}
                onSortTypeClick = {is_touch ? this.onSortTypeTap : this.onSortTypeClick}
                selectedSortText = {this.state.selected_sort_text}
                sortSelectionShown = {this.state.sort_selection_shown}
                sortHintText = {this.state.sort_hint_text}
              />
            </div>
          ) : null
        }

      </div>
    )
  }
}

export default withRouter(SearchArea);
