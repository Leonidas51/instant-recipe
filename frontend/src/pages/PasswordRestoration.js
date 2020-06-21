import React from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import {get_csrf} from "../utils/";
import Loader from "../components/shared/Loader";
import './PasswordRestoration.css';

class PasswordRestoration extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirm_loading: true,
      confirm_error: null,
      input_pass: '',
      restore_success: false,
      restore_error: null
    }

    this.onPassInputChange = this.onPassInputChange.bind(this);
    this.onConfirmClick = this.onConfirmClick.bind(this);
  }

  componentDidMount() {
    this.confirmRestore();
  }

  confirmRestore() {
    fetch(`/api/user/restore/${this.props.match.params.token}/`)
      .then(response => {
        this.setState({confirm_loading: false});

        if(response.status !== 200) {
          response.json()
            .then(result => {
              this.setState({confirm_error: result.message});
            })
        }
      })
  }

  restorePassword(new_pass) {
    get_csrf().then((csrf) => {
      fetch('/api/user/restore_password_new_password/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: new_pass
        })
      })
        .then(response => {
          if(response.status === 200) {
            this.setState({restore_success: true});
          } else {
            response.json()
              .then(result => {
                this.setState({restore_error: result.message});
              })
          }
        })
    })
  }

  onPassInputChange(e) {
    this.setState({input_pass: e.target.value});
  }

  onConfirmClick(e) {
    this.restorePassword(this.state.input_pass);
  }

  render() {
    let restore_body;

    if(this.state.confirm_error) {
      restore_body = <div>{this.state.confirm_error}</div>
    } else if(this.state.restore_success) {
      restore_body = (
        <div>
          <div className="restore__text">Пароль успешно восстановлен!</div>
          <Link className="link" to="/">Перейти на главную</Link>
        </div>
      )
    } else {
      restore_body = (
        <div>
          <div className="restore__text">Введите новый пароль:</div>
          <input className="auth__input" type="password" value={this.state.input_pass} onChange={this.onPassInputChange} />
          {this.state.restore_error ? <div className=" restore__error auth__error">{this.state.restore_error}</div> : null}
          <div className="restore__confirm-button" onClick={this.onConfirmClick}>Подтвердить</div>
        </div>
      )
    }

    return (
      <div className="content-area">
        {
          this.state.confirm_loading
            ? <Loader />
            : restore_body
        }
      </div>
    )
  }
}

export default withRouter(PasswordRestoration);
