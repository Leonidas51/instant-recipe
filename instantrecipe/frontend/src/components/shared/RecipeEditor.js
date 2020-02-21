import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Loader from "./Loader";
import Modal from "../hoc/Modal";
import SuccessModal from "../SuggestRecipe/SuccessModal";
import "./RecipeEditor.css";
import {get_csrf} from '../../utils';

class RecipeEditor extends React.Component {
  constructor(props) {
    super(props);

    //сделать до релиза для админки: теги и чекбокс "featured"

    const recipe = this.props.recipe || {};

    //для тестирования
    /*const recipe = {
      recipe_name: 'Мой рецепт',
      cooking_time_min: 15,
      cooking_time_max: 45,
      difficulty: 4,
      serves: 2,
      ings: [{amount: "1", id: "4f6d5ab92c607d97620000f4", name: "аджика"}, {amount: "100г", id: "4f6d5ab92c607d9762000120", name: "сыр"}],
      opt_ings: [{amount: "по вкусу", name: "соль"}],
      steps: ['готовить', 'посолить', 'кушать']
    }*/

    this.state = {
      recipe_id: recipe._id || null,
      recipe_name: recipe.recipe_name || '',
      cooking_time_min: recipe.cooking_time_min || '',
      cooking_time_max: recipe.cooking_time_max || '',
      difficulty: recipe.difficulty || 1,
      serves: recipe.serves || '',
      current_ing_id: '',
      current_ing_name: '',
      current_ing_amount: '',
      current_ing_error: '',
      ing_chosen: false,
      ings_suggest: [],
      ings_suggest_error: '',
      ings: recipe.ings || [],
      current_opt_ing_name: '',
      current_opt_ing_amount: '',
      current_opt_ing_error: '',
      opt_ings: recipe.opt_ings || [],
      steps: recipe.steps || ['', ''],
      steps_error: '',
      photo: '',
      upload_key: Date.now(),
      featured: recipe.featured || false,
      submit_error: '',
      submit_pending: false,
      success_modal_open: false
    }

    this.ing_input = React.createRef();

    this.onInputChange = this.onInputChange.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
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
    this.onSaveBtnClick = this.onSaveBtnClick.bind(this);
    this.onDeleteBtnClick = this.onDeleteBtnClick.bind(this);
    this.saveRecipe = this.saveRecipe.bind(this);
    this.deleteRecipe = this.deleteRecipe.bind(this);
  }
  
  componentDidMount() {
    let i = 0;

    while(this.state.steps[i]) {
      this.setState({
        ['step_' + i]: this.state.steps[i]
      })
      i++;
    }
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

  onCheckboxChange(e) {
    this.setState({
      [e.target.name]: e.target.checked
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
      this.setState({
        current_ing_error: 'Выберите ингредиент из всплывающего списка',
        ings_suggest: [],
        ings_suggest_error: ''
      });
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

  onSuccessModalClose(e) {
    return;
  }

  parseInstructions(steps) {
    let result = '';
    
    steps.forEach((step, i) => {
      if(!step.length) return;
      result += `${i+1}. ${step} \n`
    })

    return result.trim();
  }

  onSuggestFormSubmit(e) {
    e.preventDefault();
    this.setState({submit_pending: true});

    const data = new FormData();

    ['recipe_name', 'cooking_time_min', 'cooking_time_max', 'serves', 'difficulty', 'photo']
      .forEach(prop => {
        data.append([prop], this.state[prop]);
      });

    ['ings', 'opt_ings']
      .forEach(prop => {
        data.append([prop], JSON.stringify(this.state[prop]));
      })

    data.append('steps', this.parseInstructions(this.state.steps));

    get_csrf().then(csrf => {
      fetch('/api/recipe/suggest', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf
        },
        body: data
      })
        .then(response => {
          this.setState({submit_pending: false});
          if(response.status === 400) {
            response.json()
              .then(result => {
                this.setState({
                  submit_error: result.error
                })
              })
          } else if(response.status === 403) {
            this.setState({submit_error: 'Для выполнения этого действия нужно авторизоваться и подтвердить аккаунт'});
          } else if(response.status === 200) {
            this.setState({success_modal_open: true});
          } else {
            this.setState({
              submit_error: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'
            })
          }
        })
    })
  }

  onSaveBtnClick(e) {
    this.saveRecipe();
  }

  onDeleteBtnClick(e) {
    this.deleteRecipe(this.state.recipe_id);
  }
  
  saveRecipe() {
    const data = new FormData();

    ['recipe_id', 'recipe_name', 'cooking_time_min', 'cooking_time_max', 'serves', 'difficulty', 'photo', 'featured']
      .forEach(prop => {
        data.append([prop], this.state[prop]);
      });

    ['ings', 'opt_ings']
      .forEach(prop => {
        data.append([prop], JSON.stringify(this.state[prop]));
      })

    data.append('steps', this.parseInstructions(this.state.steps));
    
    get_csrf().then(csrf => {
      fetch('/api/admin/edit_recipe', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf
        },
        body: data
      })
        .then(response => {
          if(response.status === 200) {
            alert('Успешно!');
          } else {
            alert('Ошибка сервера');
          }
      })
    })
  }

  deleteRecipe(recipe_id) {
    if(confirm('Точно удалить?')) {
      get_csrf().then(csrf => {
        fetch('/api/admin/delete_recipe', {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrf,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipe_id: recipe_id
          })
        })
          .then(response => {
            if(response.status === 200) {
              alert('Успешно!');
            } else {
              alert('Ошибка сервера');
            }
          })
      })
    }
  }

  render() {
    const SuccessModalBody = Modal(
      SuccessModal,
      this.onSuccessModalClose
    );

    return (
      <React.Fragment>
        <Helmet>
          <title>Предложить рецепт - Рецепт Быстрого Приготовления</title>
        </Helmet>

        {
          this.state.success_modal_open
          ? <SuccessModalBody />
          : null
        }

          <div className="recipe-editor">
            <form onSubmit={this.onSuggestFormSubmit}>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name">Название<span className="recipe-editor__required-asterisk">*</span></div>
                <div className="recipe-editor__input-area">
                  <input type="text" className="recipe-editor__text-input recipe-editor__text-input_name" value={this.state.recipe_name} name="recipe_name" onChange={this.onInputChange} />
                </div>
              </div>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name">Время приготовления (в минутах)<span className="recipe-editor__required-asterisk">*</span></div>
                <div className="recipe-editor__input-area">
                  <input type="number" className="recipe-editor__text-input  recipe-editor__text-input_number" value={this.state.cooking_time_min} min="1" name="cooking_time_min" onChange={this.onInputChange} />
                  <div className="recipe-editor__dash">—</div>
                  <input type="number" className="recipe-editor__text-input  recipe-editor__text-input_number" value={this.state.cooking_time_max} min="1" name="cooking_time_max" onChange={this.onInputChange} />
                </div>
              </div>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name">Сложность<span className="recipe-editor__required-asterisk">*</span></div>
                <div className="recipe-editor__input-area">
                  <select className="recipe-editor__select recipe-editor__select_difficulty" name="difficulty" value={this.state.difficulty} onChange={this.onInputChange}>
                    <option value="1">Элементарно</option>
                    <option value="2">Легко</option>
                    <option value="3">Не так уж и легко</option>
                    <option value="4">Придется попотеть</option>
                    <option value="5">Сложно</option>
                    <option value="6">Очень сложно</option>
                  </select>
                </div>
              </div>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name">Число порций<span className="recipe-editor__required-asterisk">*</span></div>
                <div className="recipe-editor__input-area">
                  <input type="number" className="recipe-editor__text-input  recipe-editor__text-input_number" value={this.state.serves} min="1" name="serves" onChange={this.onInputChange} />
                </div>
              </div>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name recipe-editor__input-name_taller">Ингредиенты<span className="recipe-editor__required-asterisk">*</span></div>
                <div className="recipe-editor__input-area">
                  {
                    this.state.ings.length
                    ? <div className="recipe-editor__chosen_ings"> {this.state.ings.map((ing, index) => {
                      return (
                        <div className="recipe-editor__chosen-ing" key={ing.id}>
                          <div className="recipe-editor__chosen-ing-name">{index + 1}. {ing.name}</div>
                          <div className="recipe-editor__chosen-ing-amount">{ing.amount}</div>
                          <div className="recipe-editor__chosen-ing-remove"><span data-id={ing.id} onClick={this.onRemoveIngClick}>✖</span></div>
                        </div>
                      )
                    })} </div>
                    : null
                  } 
                  <div className="recipe-editor__ings-inputs">
                  <input
                    type="text"
                    className="recipe-editor__text-input recipe-editor__text-input_ing"
                    value={this.state.current_ing_name}
                    name="current_ing_name"
                    onChange={this.onIngInputChange}
                    ref={this.ing_input}
                    placeholder="Ингредиент"
                    disabled={this.state.ing_chosen}
                  />
                  {
                    this.state.ing_chosen
                    ? <div className="recipe-editor__ing-input-clear" onClick={this.onClearIngClick}>✖</div>
                    : null 
                  }
                  {
                    this.state.ings_suggest.length && !this.state.ings_suggest_error.length ?
                    <div className="recipe-editor__ing-suggestions">
                      {this.state.ings_suggest.map(ing => {
                        return <div data-id={ing._id} data-name={ing.name} key={ing._id} className="recipe-editor__suggested-ing" onClick={this.onSuggestedIngClick}>{ing.name}</div>
                      })}
                    </div>
                    : null
                  }
                  {
                    this.state.ings_suggest_error.length ?
                    <div className="recipe-editor__ing-suggestions">
                      <div className="recipe-editor__suggested-ing-error">{this.state.ings_suggest_error}</div>
                    </div>
                    : null
                  }
                  <input
                    type="text"
                    className="recipe-editor__text-input recipe-editor__text-input_ing_amount"
                    value={this.state.current_ing_amount}
                    name="current_ing_amount"
                    onChange={this.onInputChange}
                    placeholder="Кол-во"
                  />
                  <div className="recipe-editor__add-ing-btn link" onClick={this.onAddIngClick}>+ Добавить</div>
                  {
                    this.state.current_ing_error.length
                    ? <div className="recipe-editor__ings-error">{this.state.current_ing_error}</div>
                    : null
                  }
                  </div>
                </div>
              </div>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name recipe-editor__input-name_taller">Можно добавить</div>
                <div className="recipe-editor__input-area">
                  {
                    this.state.opt_ings.length
                    ? <div className="recipe-editor__chosen_ings"> {this.state.opt_ings.map((ing, index) => {
                      return (
                        <div className="recipe-editor__chosen-ing" key={ing.name}>
                          <div className="recipe-editor__chosen-ing-name">{index + 1}. {ing.name}</div>
                          <div className="recipe-editor__chosen-ing-amount">{ing.amount}</div>
                          <div className="recipe-editor__chosen-ing-remove"><span data-index={index} onClick={this.onRemoveOptIngClick}>✖</span></div>
                        </div>
                      )
                    })} </div>
                    : null
                  }
                  <div className="recipe-editor__ings-inputs">
                    <input
                      type="text"
                      className="recipe-editor__text-input recipe-editor__text-input_ing"
                      value={this.state.current_opt_ing_name}
                      name="current_opt_ing_name"
                      onChange={this.onInputChange}
                      placeholder="Можно добавить"
                    />
                    <input
                      type="text"
                      className="recipe-editor__text-input recipe-editor__text-input_ing_amount"
                      value={this.state.current_opt_ing_amount}
                      name="current_opt_ing_amount"
                      onChange={this.onInputChange}
                      placeholder="Кол-во"
                    />
                    <div className="recipe-editor__add-ing-btn link" onClick={this.onAddOptIngClick}>+ Добавить</div>
                    {
                      this.state.current_opt_ing_error.length
                      ? <div className="recipe-editor__ings-error">{this.state.current_opt_ing_error}</div>
                      : null
                    }
                  </div>
                </div>
              </div>
              <div className="recipe-editor__data-container">
                <div className="recipe-editor__input-name recipe-editor__input-name_taller">Инструкции<span className="recipe-editor__required-asterisk">*</span></div>
                <div className="recipe-editor__input-area">
                  {this.state.steps.map((step, i) => {
                    return (
                      <div key={i} className="recipe-editor__step">
                        <span className="recipe-editor__step-number">{i+1+'.'}</span>
                        <textarea
                          className="recipe-editor__text-input recipe-editor__text-input_step"
                          name={'step_' + i} value={this.state['step_' + i]} onChange={this.onStepInputChange}
                          data-count={i}
                        />
                        <div className="recipe-editor__remove-step" data-count={i} onClick={this.onRemoveStepClick}>✖</div>
                      </div>
                    )
                  })}
                  <div className="link" onClick={this.onAddStepClick}>+ Добавить шаг</div>
                  {
                    this.state.steps_error
                    ? <div className="recipe-editor__steps-error">{this.state.steps_error}</div>
                    : null
                  }
                </div>
              </div>
              {
                this.props.isAdmin
                ? null
                : (<div className="recipe-editor__data-container">
                    <div className="recipe-editor__input-name">Фото (.png .jpeg .jpg не более 5МБ)</div>
                    <div className="recipe-editor__input-area">
                      <input className="recipe-editor__file-input" type="file" key={this.state.upload_key} onChange={this.onPhotoUploadChange} />
                      {
                        this.state.photo !== ''
                        ? <span className="recipe-editor__file-remove" onClick={this.onRemovePhotoClick}>✖</span>
                        : null
                      }
                    </div>
                  </div>)
              }
              {
                this.props.isAdmin
                ? (<div className="recipe-editor__data-container">
                    <div className="recipe-editor__input-name">Featured?</div>
                    <div className="recipe-editor__input-area">
                      <input type="checkbox" checked={this.state.featured} name="featured" onChange={this.onCheckboxChange} />
                    </div>
                  </div>)
                : null
              }
              {
                this.state.submit_error.length
                  ? <div className="recipe-editor__submit-error">{this.state.submit_error}</div>
                  : null
              }
              {
                this.state.submit_pending
                ? <Loader />
                : (<div className="recipe-editor__submit-container">
                    {
                      this.props.isAdmin
                      ? (
                          <React.Fragment>
                            <div className="recipe-editor__submit-btn" onClick={this.onSaveBtnClick}>Сохранить</div>
                            <div className="recipe-editor__delete-btn" onClick={this.onDeleteBtnClick}>Удалить</div>
                          </React.Fragment>
                        )
                      : <input className="recipe-editor__submit-btn" type="submit" value="Отправить" />
                    }
                  </div>)
              }
            </form>
          </div>
      </React.Fragment>
    );
  }
}

export default RecipeEditor;