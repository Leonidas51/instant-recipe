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

    const search_type =  this.props.match.params.type || this.props.cookies.get('search_type') || 'by_ings',
          sort = this.props.match.params.sort || this.props.cookies.get(`${search_type}_sort`) || 'min-expense';

    this.props.cookies.set(`${search_type}_sort`, sort, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});
    this.props.cookies.set('search_type', search_type, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});

    this.state = {
      error: null,
      search_type: search_type,
      input_value: '',
      suggestions: [],
      focused_suggestion: -1,
      selected_items: [],
      search_query: null,
      types_open: false,
      random_ing: {},
      random_tag: {},
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
      this.fetchRandomTag();
    }

    window.addEventListener('click', this.onWindowClick);
  }

  componentDidUpdate() {
    if(this.state.preselect_required && this.props.ingredientList) {
      this.setState({
        selected_items: this.props.ingredientList,
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
    this.fetchSuggestedIngs = debounce(this.fetchSuggestedIngs, 300);
    this.fetchSuggestedTags = debounce(this.fetchSuggestedTags, 300);
    this.onSortTypeClick = this.onSortTypeClick.bind(this);
    this.onSortTypeHover = this.onSortTypeHover.bind(this);
    this.onSortClick = this.onSortClick.bind(this);
    this.onSortTypeTap = this.onSortTypeTap.bind(this);
    this.onTypesBottomClick = this.onTypesBottomClick.bind(this);
    this.onSearchTypeChange = this.onSearchTypeChange.bind(this);
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

  fetchRandomTag() {
    fetch('/api/random_tag/')
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Тэги не найдены"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                random_tag: result
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

  fetchSuggestedIngs(query) {
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

  fetchSuggestedTags(query) {
    fetch(`/api/tag/${query}`)
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
	
	prepareQuery(args) {
		let query;

		switch(this.state.search_type) {
			case 'by_ings':
				query = this._prepareQueryIngs(...args);
				break;
			case 'by_name':
				query = this._prepareQueryName(...args);
				break;
			case 'by_tags':
				query = this._prepareQueryTags(...args);
				break;
		}

		return query;
	}

  _prepareQueryIngs(ings, sort) {
    let selected_items,
        selected_sort = sort || this.state.selected_sort,
        query_obj = {},
        query;

    selected_items = ings || this.state.selected_items;

    if (selected_items.length) {
      query_obj = selected_items.reduce((accumulated, addition) => {
        return {id: accumulated.id + "&" + addition.id};
      });

      return encodeURI(`/recipes/by_ings/${query_obj.id}/${selected_sort}`);
    }

    return null;
  }

  _prepareQueryName(val, sort) {
		const selected_sort = sort || this.state.selected_sort,
					search = val || this.state.input_value;
    
    if(!search.length) {
      return null;
    }

    return encodeURI(`/recipes/by_name/${search}/${selected_sort}`)
  }

  _prepareQueryTags(tags, sort) {
    let query_obj;
		const selected_sort = sort || this.state.selected_sort,
					search = tags || this.state.selected_items;

    if(!search.length) {
			return null;
    }

		query_obj = search.reduce((accumulated, addition) => {
			return {id: accumulated.id + "&" + addition.id};
		});
		return encodeURI(`/recipes/by_tags/${query_obj.id}/${selected_sort}`);
  }

  addListItem(item) {
    if(this.checkDuplicate(item)) {
      this.setState({
        input_value: '',
        suggestions: [],
        focused_suggestion: -1
      });
    } else {
      this.setState({
        input_value: '',
        suggestions: [],
        selected_items: [...this.state.selected_items, item],
        search_query: this.prepareQuery([[...this.state.selected_items, item], this.state.selected_sort]),
        focused_suggestion: -1
      })
    };
  }

  checkDuplicate(item) {
    if(this.state.selected_items.find(element => {
      return element.id === item.id;
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

  parseSearchType(type) {
    switch(type) {
      case 'by_ings':
        return 'Поиск по ингредиентам';
      case 'by_name':
        return 'Поиск по названию';
      case 'by_tags':
        return 'Поиск по тегам';
      default:
        return '';
    }
  }

  /* dom events */

  onWindowClick(e) {
    this.closeSort();
  }

  onChangeInput(e) {
    const input_val = e.target.value;

    this.setState({input_value: input_val}, () => {
      if(!input_val) {
        if(this.state.search_type === 'by_name') {
          this.setState({search_query: this.prepareQuery([])});
        } else {
          this.setState({suggestions: []});
        }
      }
    });

    if(!input_val) {
      return;
    }

    switch(this.state.search_type) {
      case 'by_ings':
        this.fetchSuggestedIngs(input_val);
        break;
      case 'by_name':
        this.setState({
          search_query: this.prepareQuery([input_val])
        })
        break;
      case 'by_tags':
        this.fetchSuggestedTags(input_val);
        break;
    }
  }

  onSuggestClick(e) {
    const new_item = {
      name: e.target.dataset.name,
      id: e.target.dataset.id
    };

    this.addListItem(new_item);
    this.input.current.focus();
  }

  onSuggestHover(e) {
    if(this.state.focused_suggestion !== e.target.dataset.count) {
      this.setState({focused_suggestion: e.target.dataset.count});
    }
  }

  onSampleClick(e) {
    const sample = {
      name: e.target.dataset.name,
      id: e.target.dataset.id
    };

    this.addListItem(sample);
  }

  onDeleteClick(e) {
    const del_id = e.target.parentNode.dataset.id;

    let selected_items;

    selected_items = this.state.selected_items.filter((ing) => {
      return ing.id !== del_id;
    })

    this.setState({
      selected_items: selected_items,
      search_query: this.prepareQuery([selected_items, this.state.selected_sort])
    });

    this.input.current.focus();
  }

  onInputKeyPress(e) {
    const key = e.key;

    let new_item;

    if(this.state.search_type === 'by_name') {
      if(this.state.input_value.length && key === 'Enter') {
        this.props.history.push(this.state.search_query);
      }

      return;
    }

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
          new_item = {
            name: this.state.suggestions[this.state.focused_suggestion].name,
            id: this.state.suggestions[this.state.focused_suggestion]._id
          }

          this.addListItem(new_item);
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
			search_query: this.prepareQuery([null, e.target.dataset.sortType])
		}, () => {
			this.props.cookies.set(`${this.state.search_type}_sort`, this.state.selected_sort, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});
			this.props.history.push(this.state.search_query);
		})
  }

  onSortTypeHover(e) {
    this.setState({
      sort_hint_text: this.setSortHint(e.target.dataset.sortType)
    })
  }

  onTypesBottomClick(e) {
    this.setState(prevState => {
      return {types_open: !prevState.types_open};
    })
  }

  onSearchTypeChange(e) {
		let new_sort = this.props.cookies.get(`${e.target.value}_sort`);

		if(!new_sort) {
			if(e.target.value === 'by_ings') {
				new_sort = 'min-expense';
			} else {
				new_sort = 'timeasc';
			}

			this.props.cookies.set(`${e.target.value}_sort`, new_sort, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});
		}

		this.props.cookies.set('search_type', e.target.value, {path: '/', expires: new Date(new Date().getTime()+1000*60*60*24*365)});

    this.setState({
      search_type: e.target.value,
			selected_items: [],
			search_query: null,
			selected_sort: new_sort,
			types_open: false
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
            placeholder={this.parseSearchType(this.state.search_type)}
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

          <div className={"search-types" + (this.state.types_open ? " search-types_open" : "")}>
            <div className="search-types__selection">
              <RadioButton
                name="search-type" value="by_ings"
                onChange={this.onSearchTypeChange} checked={this.state.search_type === 'by_ings'}
                negative={true} text="По ингредиентам"
              />
              <RadioButton
                name="search-type" value="by_name"
                onChange={this.onSearchTypeChange} checked={this.state.search_type === 'by_name'}
                negative={true} text="По названию"
              />
              <RadioButton
                name="search-type" value="by_tags"
                onChange={this.onSearchTypeChange} checked={this.state.search_type === 'by_tags'}
                negative={true} text="По тегам"
              />
            </div>
            <div className="search-types__divider"></div>
            <div className="search-types__bottom" onClick={this.onTypesBottomClick}>
              <svg className="search-types__arrows">
                <use xlinkHref="#two-arrows" />
              </svg>
            </div>
          </div>
        </div>

        {
          this.props.showSample && this.state.search_type === 'by_ings' &&
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
        }
        {
          this.props.showSample && this.state.search_type === 'by_tags' &&
          <div className="search_area__sample">
            <span>Например: </span>
            <span
              className="search_area__sample_highlited"
              data-id={this.state.random_tag._id}
              data-name={this.state.random_tag.name}
              onClick={this.onSampleClick}
            >
              {this.state.random_tag.name}
            </span>
          </div>
        }
        <div className="search_area__selected-ings">
          {
            this.state.selected_items.map((ing, i) => {
                return <SelectedIng key={ing.id} ingredient={ing} onDeleteClick={this.onDeleteClick} />
            })
          }
        </div>

        {
          this.props.showSettings ? (
            <div className="search-settings">
              <SortSelection
                searchByIngs = {this.state.search_type === 'by_ings'}
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
