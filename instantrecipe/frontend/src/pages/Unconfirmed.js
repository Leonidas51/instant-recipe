import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Errors.css";

class Unconfirmed extends React.Component {
  constructor(props) {
    super(props);
    this.resend = this.resend.bind(this);
  }

  resend(e) {
    fetch('/api/user/resend_verification_email/', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': this.props.cookies.get('csrftoken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resend: true
      })
    })
      .then((response) => {
        if(response.status === 200) {
          response.json()
            .then((result) => {
              alert(result.message);
            })
        } else if(response.status === 400) {
          response.json()
            .then((result) => {
              this.setState({
                error: result.message
              });
            })
        } else {
          this.setState({
            error: 'Произошла ошибка сервера. Попробуйте позже.'
          })
        }
      })
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <title>О нас - Рецепт Быстрого Приготовления</title>
        </Helmet>
        <div className="content-area content-area_not-found">
          <h2 className="error__title">Ошибка</h2>
          <p className="error__description">
            Для выполнения этого действия требуется подтвердить e-mail.<br />
            Не получили e-mail? <a className="error__button" onClick={this.resend}>[Послать еще раз]</a>
          </p>
        </div>
      </React.Fragment>
    )
  }
}

export default Unconfirmed;
