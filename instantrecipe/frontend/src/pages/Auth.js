import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class Auth extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      login_email: '',
      login_pass: '',
      reg_email: '',
      reg_username: '',
      reg_pass: ''
    }

    this.onRegEmailChange = this.onRegEmailChange.bind(this);
    this.onRegUsernameChange = this.onRegUsernameChange.bind(this);
    this.onRegPasswordChange = this.onRegPasswordChange.bind(this);
    this.onLoginEmailChange = this.onLoginEmailChange.bind(this);
    this.onLoginPassChange = this.onLoginPassChange.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
  }

  onRegEmailChange(e) {
    this.setState({reg_email: e.target.value});
  }

  onRegUsernameChange(e) {
    this.setState({reg_username: e.target.value});
  }

  onRegPasswordChange(e) {
    this.setState({reg_pass: e.target.value});
  }

  onLoginEmailChange(e) {
    this.setState({login_email: e.target.value});
  }

  onLoginPassChange(e) {
    this.setState({login_pass: e.target.value});
  }

  login(e) {
    const {login_email, login_pass} = this.state;

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
  }

  register(e) {
    const {reg_email, reg_username, reg_pass} = this.state;

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
  }

  render() {
    return (
      <div className="content-area content-area_auth">
        <div className="auth__registration">
          <input type="text" placeholder="email" value={this.state.reg_email} onChange={this.onRegEmailChange} /><br />
          <input type="text" placeholder="username" value={this.state.reg_username} onChange={this.onRegUsernameChange} /><br />
          <input type="password" placeholder="password" value={this.state.reg_pass} onChange={this.onRegPasswordChange} /><br /><br />
          <div className="auth__button auth__register-button" onClick={this.register}>Зарегистрироваться</div><br />
        </div>
        <div className="auth__login">
          <input type="text" placeholder="email" value={this.state.login_email} onChange={this.onLoginEmailChange} /><br />
          <input type="password" placeholder="password" value={this.state.login_pass} onChange={this.onLoginPassChange} /><br /><br />
          <div className="auth__button auth__login-button" onClick={this.login}>Войти</div>
        </div>
      </div>
    )
  }
}

export default Auth;