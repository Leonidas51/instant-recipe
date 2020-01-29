import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./SuggestRecipe.css";

class SuggestRecipe extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      recipe_name: '',
      time_min: '',
      time_max: '',
      difficulty: 1,
      current_ing_id: '',
      current_ing_name: '',
      current_ing_amount: '',
      current_ing_error: '',
      ing_chosen: false,
      ings_suggest: [],
      ings_suggest_error: '',
      ings: [],
      current_opt_ing_name: '',
      current_opt_ing_amount: '',
      current_opt_ing_error: '',
      opt_ings: [],
      steps: ['', ''],
      steps_error: '',
      photo: '',
      upload_key: Date.now()
    }

    this.ing_input = React.createRef();

    this.onInputChange = this.onInputChange.bind(this);
    this.onIngInputChange = this.onIngInputChange.bind(this);
    this.onStepInputChange = this.onStepInputChange.bind(this);
    this.onSuggestedIngClick = this.onSuggestedIngClick.bind(this);
    this.onClearIngClick = this.onClearIngClick.bind(this);
    this.onRemoveIngClick = this.onRemoveIngClick.bind(this);
    this.onRemoveOptIngClick = this.onRemoveOptIngClick.bind(this);
    this.onAddIngClick = this.onAddIngClick.bind(this);
    this.onAddOptIngClick = this.onAddOptIngClick.bind(this);
    this.onAddStepClick = this.onAddStepClick.bind(this);
    this.onRemoveStepClick = this.onRemoveStepClick.bind(this);
    this.onPhotoUploadChange = this.onPhotoUploadChange.bind(this);
    this.onRemovePhotoClick = this.onRemovePhotoClick.bind(this);
    this.onSuggestFormSubmit = this.onSuggestFormSubmit.bind(this);
  }

  fetchSuggestedIngs(query) {
    let error = '';

    fetch(`/api/ingredient/${query}`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          return [];
        }
      })
      .then(result => {
        if(!result.length) {
          error = 'Ингредиенты не найдены!'
        }
        
        if(result.length > 5) {
          result.length = 5;
        }

        this.setState({
          ings_suggest: result,
          ings_suggest_error: error
        });
      })
      .catch(err => {
        console.error(err);
      })
  }

  onInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  onIngInputChange(e) {
    this.onInputChange(e);

    if(e.target.value.length) {
      this.fetchSuggestedIngs(e.target.value);
    } else {
      this.setState({
        ings_suggest: [],
        ings_suggest_error: ''
      });
    }
  }

  onStepInputChange(e) {
    const new_steps = this.state.steps;

    new_steps.splice(e.target.dataset.count, 1, e.target.value);
    this.setState({
      steps: new_steps,
      steps_error: ''
    })

    this.onInputChange(e);
  }

  onSuggestedIngClick(e) {
    let dupe_ing = false;

    this.state.ings.forEach((ing) => {
      if(ing.id === e.target.dataset.id) {
        this.setState({
          ings_suggest: [],
          current_ing_name: '',
          current_ing_error: 'Ингредиент уже есть в списке'
        })

        dupe_ing = true;
      }
    })

    if(dupe_ing) {
      return;
    }

    this.setState({
      ing_chosen: true,
      ings_suggest: [],
      current_ing_id: e.target.dataset.id,
      current_ing_name: e.target.dataset.name,
      current_ing_error: ''
    })
  }

  onClearIngClick(e) {
    this.setState({
      ing_chosen: false,
      current_ing_id: '',
      current_ing_name: ''
    }, () => {
      this.ing_input.current.focus();
    })
  }

  onRemoveIngClick(e) {
    const new_ing_list = this.state.ings.filter((ing) => {
      return e.target.dataset.id !== ing.id;
    })

    this.setState({
      ings: new_ing_list
    })
  }

  onRemoveOptIngClick(e) {
    const new_opt_ing_list = this.state.opt_ings;

    new_opt_ing_list.splice(e.target.dataset.index, 1);

    this.setState({
      opt_ings: new_opt_ing_list
    })
  }

  onAddIngClick(e) {
    if(!this.state.current_ing_id.length || !this.state.current_ing_name.length) {
      this.setState({current_ing_error: 'Выберите ингредиент из всплывающего списка'});
      return;
    }

    if(!this.state.current_ing_amount.length) {
      this.setState({current_ing_error: 'Укажите количество ингредиента'});
      return;
    }

    const new_ings_list = this.state.ings.concat({
      id: this.state.current_ing_id,
      name: this.state.current_ing_name,
      amount: this.state.current_ing_amount
    })

    this.setState({
      ings: new_ings_list,
      ing_chosen: false,
      current_ing_id: '',
      current_ing_name: '',
      current_ing_amount: '',
      current_ing_error: ''
    })
  }

  onAddOptIngClick(e) {
    let dupe_ing = false;

    if(!this.state.current_opt_ing_name.length) {
      this.setState({current_opt_ing_error: 'Введите название ингредиента'});
      return;
    }

    if(!this.state.current_opt_ing_amount.length) {
      this.setState({current_opt_ing_error: 'Укажите количество ингредиента'});
      return;
    }

    this.state.opt_ings.forEach((ing) => {
      if(ing.name === this.state.current_opt_ing_name) {
        dupe_ing = true;
      }
    })

    if(dupe_ing) {
      this.setState({current_opt_ing_error: 'Ингредиент уже есть в списке'});
      return;
    }

    const new_opt_ings_list = this.state.opt_ings.concat({
      name: this.state.current_opt_ing_name,
      amount: this.state.current_opt_ing_amount
    })

    this.setState({
      opt_ings: new_opt_ings_list,
      current_opt_ing_name: '',
      current_opt_ing_amount: '',
      current_opt_ing_error: ''
    })
  }

  onAddStepClick(e) {
    const new_steps = this.state.steps;
    new_steps.push('');
    this.setState({
      steps: new_steps,
      steps_error: ''
    })
  }

  onRemoveStepClick(e) {
    const new_steps = this.state.steps;
    if(new_steps.length < 3) {
      this.setState({steps_error: 'Укажите не менее двух шагов'});
      return;
    }

    new_steps.splice(e.target.dataset.count, 1);
    new_steps.forEach((step, i) => {
      this.setState({
        ['step_' + i]: step
      })

      if(new_steps.length === (i+1)) {
        this.setState({
          ['step_' + (i+1)]: ''
        })
      }
    })

    this.setState({
      steps: new_steps
    })
  }

  onPhotoUploadChange(e) {
    this.setState({
      photo: e.target.files[0]
    })
  }

  onRemovePhotoClick(e) {
    this.setState({
      photo: '',
      upload_key: Date.now()
    })
  }

  onSuggestFormSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>Предложить рецепт - Рецепт Быстрого Приготовления</title>
        </Helmet>

        <div className="content-area">
          <h1 className="page-title">Предложить рецепт</h1>
          <div className="suggest-form">
            <form onSubmit={this.onSuggestFormSubmit}>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name">Название</div>
                <div className="suggest-form__input-area">
                  <input type="text" className="suggest-form__text-input suggest-form__text-input_name" value={this.state.recipe_name} name="recipe_name" onChange={this.onInputChange} />
                </div>
              </div>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name">Время приготовления (в минутах)</div>
                <div className="suggest-form__input-area">
                  <input type="number" className="suggest-form__text-input suggest-form__text-input_time" value={this.state.time_min} min="1" name="time_min" onChange={this.onInputChange} />
                  <div className="suggest-form__dash">—</div>
                  <input type="number" className="suggest-form__text-input suggest-form__text-input_time" value={this.state.time_max} min="1" name="time_max" onChange={this.onInputChange} />
                </div>
              </div>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name">Сложность</div>
                <div className="suggest-form__input-area">
                  <select className="suggest-form__select suggest-form__select_difficulty" name="difficulty" value={this.state.difficulty} onChange={this.onInputChange}>
                    <option value="1">Элементарно</option>
                    <option value="2">Легко</option>
                    <option value="3">Не так уж и легко</option>
                    <option value="4">Придется попотеть</option>
                    <option value="5">Сложно</option>
                    <option value="6">Очень сложно</option>
                  </select>
                </div>
              </div>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name suggest-form__input-name_taller">Ингредиенты</div>
                <div className="suggest-form__input-area">
                  {
                    this.state.ings.length
                    ? <div className="suggest-form__chosen_ings"> {this.state.ings.map((ing, index) => {
                      return (
                        <div className="suggest-form__chosen-ing" key={ing.id}>
                          <div className="suggest-form__chosen-ing-name">{index + 1}. {ing.name}</div>
                          <div className="suggest-form__chosen-ing-amount">{ing.amount}</div>
                          <div className="suggest-form__chosen-ing-remove"><span data-id={ing.id} onClick={this.onRemoveIngClick}>✖</span></div>
                        </div>
                      )
                    })} </div>
                    : null
                  } 
                  <div className="suggest-form__ings-inputs">
                  <input
                    type="text"
                    className="suggest-form__text-input suggest-form__text-input_ing"
                    value={this.state.current_ing_name}
                    name="current_ing_name"
                    onChange={this.onIngInputChange}
                    ref={this.ing_input}
                    placeholder="Ингредиент"
                    disabled={this.state.ing_chosen}
                  />
                  {
                    this.state.ing_chosen
                    ? <div className="suggest-form__ing-input-clear" onClick={this.onClearIngClick}>✖</div>
                    : null 
                  }
                  {
                    this.state.ings_suggest.length && !this.state.ings_suggest_error.length ?
                    <div className="suggest-form__ing-suggestions">
                      {this.state.ings_suggest.map(ing => {
                        return <div data-id={ing._id} data-name={ing.name} key={ing._id} className="suggest-form__suggested-ing" onClick={this.onSuggestedIngClick}>{ing.name}</div>
                      })}
                    </div>
                    : null
                  }
                  {
                    this.state.ings_suggest_error.length ?
                    <div className="suggest-form__ing-suggestions">
                      <div className="suggest-form__suggested-ing-error">{this.state.ings_suggest_error}</div>
                    </div>
                    : null
                  }
                  <input
                    type="text"
                    className="suggest-form__text-input suggest-form__text-input_ing_amount"
                    value={this.state.current_ing_amount}
                    name="current_ing_amount"
                    onChange={this.onInputChange}
                    placeholder="Кол-во"
                  />
                  <div className="suggest-form__add-ing-btn link" onClick={this.onAddIngClick}>+ Добавить</div>
                  {
                    this.state.current_ing_error.length
                    ? <div className="suggest-form__ings-error">{this.state.current_ing_error}</div>
                    : null
                  }
                  </div>
                </div>
              </div>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name suggest-form__input-name_taller">Можно добавить</div>
                <div className="suggest-form__input-area">
                  {
                    this.state.opt_ings.length
                    ? <div className="suggest-form__chosen_ings"> {this.state.opt_ings.map((ing, index) => {
                      return (
                        <div className="suggest-form__chosen-ing" key={ing.name}>
                          <div className="suggest-form__chosen-ing-name">{index + 1}. {ing.name}</div>
                          <div className="suggest-form__chosen-ing-amount">{ing.amount}</div>
                          <div className="suggest-form__chosen-ing-remove"><span data-index={index} onClick={this.onRemoveOptIngClick}>✖</span></div>
                        </div>
                      )
                    })} </div>
                    : null
                  }
                  <div className="suggest-form__ings-inputs">
                    <input
                      type="text"
                      className="suggest-form__text-input suggest-form__text-input_ing"
                      value={this.state.current_opt_ing_name}
                      name="current_opt_ing_name"
                      onChange={this.onInputChange}
                      placeholder="Можно добавить"
                    />
                    <input
                      type="text"
                      className="suggest-form__text-input suggest-form__text-input_ing_amount"
                      value={this.state.current_opt_ing_amount}
                      name="current_opt_ing_amount"
                      onChange={this.onInputChange}
                      placeholder="Кол-во"
                    />
                    <div className="suggest-form__add-ing-btn link" onClick={this.onAddOptIngClick}>+ Добавить</div>
                    {
                      this.state.current_opt_ing_error.length
                      ? <div className="suggest-form__ings-error">{this.state.current_opt_ing_error}</div>
                      : null
                    }
                  </div>
                </div>
              </div>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name suggest-form__input-name_taller">Инструкции</div>
                <div className="suggest-form__input-area">
                  {this.state.steps.map((step, i) => {
                    return (
                      <div key={i} className="suggest-form__step">
                        <span className="suggest-form__step-number">{i+1+'.'}</span>
                        <textarea
                          className="suggest-form__text-input suggest-form__text-input_step"
                          name={'step_' + i} value={this.state['step_' + i]} onChange={this.onStepInputChange}
                          data-count={i}
                        />
                        <div className="suggest-form__remove-step" data-count={i} onClick={this.onRemoveStepClick}>✖</div>
                      </div>
                    )
                  })}
                  <div className="link" onClick={this.onAddStepClick}>+ Добавить шаг</div>
                  {
                    this.state.steps_error
                    ? <div className="suggest-form__steps-error">{this.state.steps_error}</div>
                    : null
                  }
                </div>
              </div>
              <div className="suggest-form__data-container">
                <div className="suggest-form__input-name">Фото</div>
                <div className="suggest-form__input-area">
                  <input className="suggest-form__file-input" type="file" key={this.state.upload_key} onChange={this.onPhotoUploadChange} />
                  {
                    this.state.photo !== ''
                    ? <span className="suggest-form__file-remove" onClick={this.onRemovePhotoClick}>✖</span>
                    : null
                  }
                </div>
              </div>
              <div className="suggest-form__submit-container">
                <input className="suggest-form__submit-btn" type="submit" value="Отправить" />
              </div>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SuggestRecipe;