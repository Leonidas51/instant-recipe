import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Loader from "./Loader";
import "./Auth.css";

class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login_email: '',
      login_pass: '',
      reg_email: '',
      reg_username: '',
      reg_pass: '',
      reg_pass_repeat: '',
      reg_pass_match: true,
      mode: 'register',
      error: null
    }

    this.onRegEmailChange = this.onRegEmailChange.bind(this);
    this.onRegUsernameChange = this.onRegUsernameChange.bind(this);
    this.onRegPasswordChange = this.onRegPasswordChange.bind(this);
    this.onRegPasswordRepeatChange = this.onRegPasswordRepeatChange.bind(this);
    this.onLoginEmailChange = this.onLoginEmailChange.bind(this);
    this.onLoginPassChange = this.onLoginPassChange.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this._login = this._login.bind(this);
    this._register = this._register.bind(this);
  }

  _login(e) {
    const {login_email, login_pass} = this.state;
    this.switchMode('loading')();

    fetch('api/user/login/', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.props.cookies.get('csrftoken'),
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
              this.switchMode('success')();
              this.props.login(result.username);
            })
        } else if(response.status === 400) {
          response.json()
            .then((result) => {
              this.setState({error: result.message});
            })
        } else {
          this.setState({
            error: 'Произошла ошибка сервера. Попробуйте позже.'
          })
        }
      })
  }

  _register(e) {
    const {reg_email, reg_username, reg_pass} = this.state;
    this.switchMode('loading')();

    fetch('/api/user/register/', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.props.cookies.get('csrftoken'),
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
              this.switchMode('success')();
              this.props.register(result.username);
            })
        } else if(response.status === 400) {
          response.json()
            .then((result) => {
              this.setState({error: result.message});
            })
        } else {
          this.setState({
            error: 'Произошла ошибка сервера. Попробуйте позже.'
          })
        }
      })
  }

  /* dom events */
  
  onRegEmailChange(e) {
    this.setState({reg_email: e.target.value});
  }

  onRegUsernameChange(e) {
    this.setState({reg_username: e.target.value});
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

  switchMode(mode) {
    return function(e) {
      this.setState({mode: mode});
    }.bind(this);
  }

  /* end dom events */

  render() {
    let body;

    switch(this.state.mode) {
      case 'register':
        body = (
          <div className="auth__registration">
            <h2 className="auth__title">Регистрация</h2>
            <div className="auth__field">
              <div className="auth__field-name">E-mail</div>
              <input className="auth__input" type="text" value={this.state.reg_email} onChange={this.onRegEmailChange} />
            </div>
            <div className="auth__field">
              <div className="auth__field-name">Имя</div>
              <input className="auth__input" type="text" value={this.state.reg_username} onChange={this.onRegUsernameChange} />
            </div>
            <div className="auth__field">
              <div className="auth__field-name">Пароль</div>
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
            <div className="auth__button auth__register-button" onClick={this._register}>Зарегистрироваться</div>
          </div>
        );
        break;
      case 'login':
        body = (
          <div className="auth__login">
            <h2 className="auth__title">Вход</h2>
            <div className="auth__field">
              <div className="auth__field-name">E-mail</div>
              <input className="auth__input" type="text" value={this.state.login_email} onChange={this.onLoginEmailChange} />
            </div>
            <div className="auth__field">
              <div className="auth__field-name">Пароль</div>
              <input className="auth__input" type="password" value={this.state.login_pass} onChange={this.onLoginPassChange} />
            </div>
            <div className="auth__text"><span className="auth__link" onClick={this.switchMode('restore')}>Забыли пароль</span></div>
            <div className="auth__text"><span className="auth__link" onClick={this.switchMode('register')}>Зарегистрироваться</span></div>
            <div className="auth__button auth__login-button" onClick={this._login}>Войти</div>
          </div>
        );
        break;
      case 'restore':
        body = (
          <div className="auth__restore">
          <h2 className="auth__title">восстановка</h2>
          </div>
        )
        break;
      case 'success':
        body = (
          <div className="auth__success">
            <h2 className="auth__title">кайф</h2>
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