import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter, Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import Loader from "../components/shared/Loader";

class UserConfirm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      response: '',
      error: null,
      redirect: false
    }
  }

  componentDidMount() {
    fetch(`/api/user/confirm/${this.props.match.params.token}/`)
      .then(response => {
        this.setState({loading: false});
        if(response.status === 400) {
          response.json()
            .then(result => {
              this.setState({
                error: true,
                response: result.message
              })
            })
            .catch(error => {
              this.setState({
                error: true,
                response: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'
              })
            })
        } else if(response.status === 200) {
          response.json()
            .then(result => {
              this.setState({
                response: 'E-mail успешно подтверждён!'
              })
              this.setState({redirect: true})
            })
        } else {
          this.setState({
            error: true,
            response: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'
          })
        }
      })
  }

  render() {
    return (
      <div className="content-area">
        { this.state.loading
          ? <Loader text="Выполняем подтверждение..." />
          : <div>{this.state.response}</div>
        }
        {
          this.state.redirect
            ? <Link className="link" to="/">Перейти на главную</Link>
            : null
        }
      </div>
    )
  }
}

export default withRouter(UserConfirm);