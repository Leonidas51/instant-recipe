import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Redirect, withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import Loader from "../components/shared/Loader";
import Modal from "../components/hoc/Modal";
import "./Profile.css";
import {get_csrf} from "../utils";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      error: '',
      show_settings: false,
      namechange_modal_open: false,
      passchange_modal_open: false,
      new_name: '',
      namechange_error: '',
      namechange_loading: false,
      namechange_success: false,
      passchange_error: '',
      passchange_loading: false,
      passchange_success: false,
      confirm_resent: false,
      confirm_error: '',
      confirm_loading: false,
    }

    this.onSettingsBtnClick = this.onSettingsBtnClick.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onNameChangeOpenClick = this.onNameChangeOpenClick.bind(this);
    this.onNameChangeModalClose = this.onNameChangeModalClose.bind(this);
    this.onNameChangeSubmit = this.onNameChangeSubmit.bind(this); 
    this.onPassChangeOpenClick = this.onPassChangeOpenClick.bind(this);
    this.onPassChangeModalClose = this.onPassChangeModalClose.bind(this);
    this.onPassChangeSubmit = this.onPassChangeSubmit.bind(this);
    this.onRepeatConfirmClick = this.onRepeatConfirmClick.bind(this);
  }

  componentDidMount() {
    this.fetchUser(this.props.match.params.user_id);
    this.ChangeNameModal = Modal(
      ChangeNameModalBody,
      this.onNameChangeModalClose
    )

    this.ChangePassModal = Modal(
      ChangePassModalBody,
      this.onPassChangeModalClose
    )
  }

  fetchUser(id) {
    fetch(`/api/user/read_user_info/${id}/`)
      .then(response => {
        if(response.status === 200) {
          response.json()
            .then(result => {
              this.setState({user: result.user});
            })
        } else if(response.status === 204) {
          this.setState({error: 'Пользователь не найден!'});
        } else {
          this.setState({error: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'});
        }
      })
  }

  onInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  onSettingsBtnClick(e) {
    this.setState({show_settings: !this.state.show_settings});
  }

  onNameChangeOpenClick(e) {
    this.setState({namechange_modal_open: true});
  }

  onNameChangeModalClose(e) {
    this.setState({
      new_name: '',
      namechange_modal_open: false,
      namechange_loading: false,
      namechange_error: '',
      namechange_success: false
    });
  }

  onNameChangeSubmit(e) {
    e.preventDefault();
    this.setState({namechange_loading: true});
    get_csrf().then(csrf => {
      fetch('/api/user/change_user_name/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_name: this.state.new_name
        })
      })
        .then(response => {
          if(response.status === 200) {
            this.setState(
              {
                namechange_loading: false,
                namechange_success: true
              }
            );
          } else if(response.status === 400) {
            response.json()
              .then(result => {
                this.setState({
                  namechange_loading: false,
                  namechange_error: result.message
                });
              })
          } else {
            this.setState({
              namechange_loading: false,
              namechange_error: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'
            });
          }
        })
    })
  }

  onPassChangeOpenClick(e) {
    this.setState({
      passchange_modal_open: true
    })
  }

  onPassChangeModalClose(e) {
    this.setState({
      passchange_modal_open: false,
      passchange_error: '',
      passchange_loading: false,
      passchange_success: false
    })
  }

  onPassChangeSubmit(e) {
    e.preventDefault();
    this.setState({passchange_loading: true});
    get_csrf().then(csrf => {
      fetch('/api/user/change_password/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
      .then(response => {
        if(response.status === 200) {
          this.setState({
            passchange_loading: false,
            passchange_success: true
          })
        } else {
          this.setState({
            passchange_loading: false,
            passchange_error: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'
          })
        }
      })
    })
  }

  onRepeatConfirmClick(e) {
    this.setState({confirm_loading: true})
    get_csrf().then((csrf) => {
      fetch('/api/user/resend_verification_email/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resend: true
        })
      })
        .then((response) => {
          if(response.status === 200) {
            this.setState({
              confirm_loading: false,
              confirm_resent: true
            });
          } else {
            this.setState({
              confirm_loading: false,
              confirm_error: 'Произошла ошибка сервера. Попробуйте позже.'
            })
          }
        })
    })
  }

  render() {
    if(this.state.error) {
      return(
        <div className="content-area content-area_profile">
          <div>{this.state.error}</div>
        </div> 
      )
    }

    if(!this.state.user) {
      return(
        <div className="content-area content-area_profile">
          <Loader />
        </div>  
      )
    }

    const user = this.state.user;
    const ChangeNameModal = this.ChangeNameModal;
    const ChangePassModal = this.ChangePassModal;

    return (
      <React.Fragment>
        <Helmet>
          <title>{user.name} - Рецепт Быстрого Приготовления</title>
        </Helmet>

        {
          this.state.namechange_modal_open
          ? <ChangeNameModal
              inputVal={this.state.new_name} onInputChange={this.onInputChange} onSubmit={this.onNameChangeSubmit}
              loading={this.state.namechange_loading} error={this.state.namechange_error} success={this.state.namechange_success}
            />
          : null
        }

        {
          this.state.passchange_modal_open
          ? <ChangePassModal
              email={user.email} onSubmit={this.onPassChangeSubmit} loading={this.state.passchange_loading}
              error={this.state.passchange_error} success={this.state.passchange_success}
            />
          : null
        }

        <div className="content-area content-area_profile">
          <div className="user-main">
            <div className="user-main__username">{user.name}</div>
            {
              user.is_owner
              ? (<React.Fragment>
                  <div className="user-main__email">{user.email}</div>
                  {
                    user.confirmed
                    ? null
                    : <UnconfirmedWarning onRepeatConfirmClick={this.onRepeatConfirmClick} loading={this.state.confirm_loading}
                        sent={this.state.confirm_resent} error={this.state.confirm_error}
                      />
                  }
                  <div className="user-main__open-settings-btn" onClick={this.onSettingsBtnClick}>Изменить профиль</div>
                  {
                    this.state.show_settings
                    ? (<div className="user-main__settings">
                        <div className="user-main__settings-btns">
                          <div className="button-generic" onClick={this.onNameChangeOpenClick}>Изменить имя</div>
                          <div className="button-generic" onClick={this.onPassChangeOpenClick}>Изменить пароль</div>
                        </div>
                      </div>)
                    : null
                  }
                </React.Fragment>)
              : null
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

function ChangeNameModalBody(props) {
  if(props.loading) {
    return <Loader />
  }

  if(props.success) {
    return <div>Смена имени прошла успешно!</div>
  }

  return(
    <React.Fragment>
        <div className="changename__text">Изменять имя можно не чаще одного раза в месяц.</div>
        {
          props.error.length
          ? <div className="changename__error">{props.error}</div>
          : null
        }
        <form className="changename__form" onSubmit={props.onSubmit}>
          <input type="text" placeholder="Новое имя" name="new_name" value={props.inputVal} onChange={props.onInputChange} />
          <input className="button-generic" type="submit" value="Изменить" />
        </form>
    </React.Fragment>
  )
}

function ChangePassModalBody(props) {
  if(props.loading) {
    return <Loader />
  }

  if(props.success) {
    return <div>На ваш email было отправлено письмо с дальнейшими инструкциями</div>
  }

  return(
    <React.Fragment>
      <div className="changepass__text">На адрес {props.email} будет отправлено письмо со ссылкой для смены пароля</div>
      {
          props.error.length
          ? <div className="changepass__error">{props.error}</div>
          : null
      }
      <form onSubmit={props.onSubmit}>
        <input className="button-generic" type="submit" value="Отправить" />
      </form>
    </React.Fragment>
  )
}

function UnconfirmedWarning(props) {
  if(props.loading) {
    return null;
  }

  if(props.error) {
    return (
      <div className="user-main__unconfirmed">
        <span>{props.error}</span>
      </div>
    )
  }

  if(props.sent) {
    return (
      <div className="user-main__unconfirmed">
        <span>Подтверждение отправлено успешно!</span>
      </div>
    )
  }

  return (
    <div className="user-main__unconfirmed">
      <span className="user-main__unconfirmed-warning">
        Ваш email не был подтвержден. Некоторые действия могут быть недоступны.
      </span>
      <br />
      <span className="link" onClick={props.onRepeatConfirmClick}>Отправить подтверждение повторно</span>
    </div>
  )
}

export default withRouter(Profile);