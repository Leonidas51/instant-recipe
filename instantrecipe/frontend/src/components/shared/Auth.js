import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Loader from "./Loader";
import {get_csrf} from "../../utils/";
import "./Auth.css";

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reg_email: '', reg_username: '', reg_pass: '', reg_pass_repeat: '', reg_pass_match: true,
      login_email: '', login_pass: '', restore_email: '',
      mode: 'register',
      error: null,
      email_error: false,
      username_error: false
    }

    this.onLoginFormSubmit = this.onLoginFormSubmit.bind(this);
    this.onRegisterFormSubmit = this.onRegisterFormSubmit.bind(this);
    this.onRegEmailChange = this.onRegEmailChange.bind(this);
    this.onRegUsernameChange = this.onRegUsernameChange.bind(this);
    this.onRegPasswordChange = this.onRegPasswordChange.bind(this);
    this.onRegPasswordRepeatChange = this.onRegPasswordRepeatChange.bind(this);
    this.onLoginEmailChange = this.onLoginEmailChange.bind(this);
    this.onLoginPassChange = this.onLoginPassChange.bind(this);
    this.onRestoreEmailChange = this.onRestoreEmailChange.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this._login = this._login.bind(this);
    this._register = this._register.bind(this);
    this._restore = this._restore.bind(this);
  }

  validateFields() {
    if(!this.state.reg_email.length || !this.state.reg_username.length || !this.state.reg_pass.length) {
      this.setState({error: 'Заполните все поля'});
      return false;
    }

    if(!/^.+@[А-яA-z0-9]+\..+$/.test(this.state.reg_email)) {
      this.setState({
        email_error: true,
        error: 'Введите валидный E-mail'
      })
      return false;
    }

    if(!/^[-_.\'`А-яA-z0-9]+$/.test(this.state.reg_username)) {
      this.setState({
        username_error: true,
        error: 'Имя может содержать только буквы, цифры и символы - _ . \' `'
      })
      return false;
    }

    if(this.state.reg_pass.length < 6) {
      this.setState({error: 'Пароль должен содержать как минимум 6 символов'});
      return false;
    }

    if(!this.state.reg_pass_match) {
      this.setState({error: 'Введённые пароли не совпадают'});
      return false;
    }

    return true;
  }

  

  _login(e) {
    const {login_email, login_pass} = this.state;
    this.switchMode('loading')();
    get_csrf().then((csrf) => {
      fetch('/api/user/login/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: login_email,
          password: login_pass
        })
      })
        .then((response) => {
          if(response.status === 200) {
            response.json()
              .then((result) => {
                this.switchMode('login_success')();
                this.props.login(result.username);
              })
          } else if(response.status === 400) {
            response.json()
              .then((result) => {
                this.setState({
                  error: result.message,
                  mode: 'login'
                });
              })
          } else {
            this.setState({
              error: 'Произошла ошибка сервера. Попробуйте позже.',
              mode: 'login'
            })
          }
        })
    })
  }

  _register(e) {
    const {reg_email, reg_username, reg_pass} = this.state;

    if(!this.validateFields()) {
      return;
    }

    this.switchMode('loading')();

    get_csrf().then((csrf) => {
      fetch('/api/user/register/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: reg_email,
          username: reg_username,
          password: reg_pass
        })
      })
        .then((response) => {
          if(response.status === 200) {
            response.json()
              .then((result) => {
                this.switchMode('reg_success')();
                this.props.register(result.username);
              })
          } else if(response.status === 400) {
            response.json()
              .then((result) => {
                this.setState({
                  error: result.message,
                  mode: 'register'
                });
              })
          } else {
            this.setState({
              error: 'Произошла ошибка сервера. Попробуйте позже.',
              mode: 'register'
            })
          }
        })
      })
  }

  _restore(e) {
    const {restore_email} = this.state;

    this.switchMode('loading')();

    get_csrf().then((csrf) => {
      fetch('/api/user/restore_password_entered_email/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: restore_email
        })
      })
        .then((response) => {
          if(response.status === 200) {
            response.json()
              .then((result) => {
                alert('На адрес ' + restore_email + ' была отправлена ссылка для восстановления пароля.')
                this.props.close();
              })
          } else if(response.status === 400) {
            response.json()
              .then((result) => {
                this.setState({
                  error: result.message,
                  mode: 'register'
                });
              })
          } else {
            this.setState({
              error: 'Произошла ошибка сервера. Попробуйте позже.',
              mode: 'register'
            })
          }
        })
    })
  }

  /* dom events */

  onLoginFormSubmit(e) {
    e.preventDefault();
    this._login();
  }

  onRegisterFormSubmit(e) {
    e.preventDefault();
    this._register();
  }

  onRegEmailChange(e) {
    this.setState({
      reg_email: e.target.value,
      email_error: false
    });
  }

  onRegUsernameChange(e) {
    this.setState({
      reg_username: e.target.value,
      username_error: false
    });
  }

  onRegPasswordChange(e) {
    this.setState({reg_pass: e.target.value});
  }

  onRegPasswordRepeatChange(e) {
    this.setState({reg_pass_repeat: e.target.value});

    if(e.target.value === this.state.reg_pass) {
      this.setState({reg_pass_match: true});
    } else {
      this.setState({reg_pass_match: false});
    }
  }

  onLoginEmailChange(e) {
    this.setState({login_email: e.target.value});
  }

  onLoginPassChange(e) {
    this.setState({login_pass: e.target.value});
  }

  onRestoreEmailChange(e) {
    this.setState({restore_email: e.target.value});
  }

  switchMode(mode) {
    return function(e) {
      this.setState({
        mode: mode,
        error: ''
      });
    }.bind(this);
  }

  /* end dom events */

  render() {
    let body;

    switch(this.state.mode) {
      case 'register':
        body = (
          <div className="auth__registration">
            <form onSubmit={this.onRegisterFormSubmit}>
            <h2 className="auth__title">Регистрация</h2>
            <div className="auth__field">
              <div className="auth__field-name">E-mail</div>
              <input
                className={this.state.email_error ? "auth__input auth__input_outline_error" : "auth__input"}
                type="email"
                value={this.state.reg_email}
                onChange={this.onRegEmailChange}
              />
            </div>
            <div className="auth__field">
              <div className="auth__field-name">Имя</div>
              <input
                className={this.state.username_error ? "auth__input auth__input_outline_error" : "auth__input"}
                type="text"
                value={this.state.reg_username}
                onChange={this.onRegUsernameChange}
              />
            </div>
            <div className="auth__field">
              <div className="auth__field-name">Пароль (не менее 6 символов)</div>
              <input
                className={this.state.reg_pass_match ? "auth__input" : "auth__input auth__input_outline_error"}
                type="password"
                value={this.state.reg_pass}
                onChange={this.onRegPasswordChange}
              />
            </div>
            <div className="auth__field">
              <div className="auth__field-name">Повторите пароль</div>
              <input
                className={this.state.reg_pass_match ? "auth__input" : "auth__input auth__input_outline_error"}
                type="password"
                value={this.state.reg_pass_repeat}
                onChange={this.onRegPasswordRepeatChange}
              />
            </div>
            <div className="auth__text">Уже есть аккаунт? <span className="auth__link" onClick={this.switchMode('login')}>Войти</span></div>
            {this.state.error ? <div className="auth__error">{this.state.error}</div> : null}
            <input type="submit" className="auth__button auth__register-button" value="Зарегистрироваться" />
            </form>
          </div>
        );
        break;
      case 'login':
        body = (
          <div className="auth__login">
            <form onSubmit={this.onLoginFormSubmit}>
              <h2 className="auth__title">Вход</h2>
              <div className="auth__field">
                <div className="auth__field-name">E-mail</div>
                <input className="auth__input" type="email" value={this.state.login_email} onChange={this.onLoginEmailChange} />
              </div>
              <div className="auth__field">
                <div className="auth__field-name">Пароль</div>
                <input className="auth__input" type="password" value={this.state.login_pass} onChange={this.onLoginPassChange} />
              </div>
              <div className="auth__text"><span className="auth__link" onClick={this.switchMode('restore')}>Забыли пароль</span></div>
              <div className="auth__text"><span className="auth__link" onClick={this.switchMode('register')}>Зарегистрироваться</span></div>
              {this.state.error ? <div className="auth__error">{this.state.error}</div> : null}
              <input type="submit" className="auth__button auth__login-button" value="Войти" />
            </form>
          </div>
        );
        break;
      case 'restore':
        body = (
          <div className="auth__restore">
          <h2 className="auth__title">Восстановление</h2>
          <div className="auth__text">На этот адрес будет отправлено письмо для восстановления пароля</div>
          <div className="auth__field">
            <div className="auth__field-name">E-mail</div>
            <input className="auth__input" type="text" value={this.state.restore_email} onChange={this.onRestoreEmailChange} />
          </div>
          <div className="auth__button auth__login-button" onClick={this._restore}>Отправить</div>
          </div>
        )
        break;
      case 'reg_success':
        body = (
          <div className="auth__success">
            <h2 className="auth__title">Регистрация прошла успешно!</h2>
            <div className="auth__text">В течение нескольких минут на ваш адрес {this.state.reg_email} придёт письмо с подтверждением.</div>
          </div>
        )
        break;
      case 'login_success':
        body = (
          <div className="auth__success">
            <h2 className="auth__title">Вход выполнен успешно!</h2>
          </div>
        )
        break;
      case 'loading':
        body = (
          <Loader />
        )
    }

    return (
      <div className="auth">
        {body}
      </div>
    )
  }
}

export default Auth;
