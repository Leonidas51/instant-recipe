import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { CookiesProvider, withCookies } from 'react-cookie';
import {Helmet} from "react-helmet";
import {get_csrf} from "./utils/"
import "./reset.css";
import "./common.css";
import About from "./pages/About";
import Unconfirmed from "./pages/Unconfirmed";
import PasswordRestoration from "./pages/PasswordRestoration";
import UserConfirm from "./pages/UserConfirm";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecipeDetails from "./pages/RecipeDetails";
import RecipeList from "./pages/RecipeList";
import Profile from "./pages/Profile";
import Indev from "./pages/Indev";
import Admin from "./pages/Admin";
import Modal from "./components/hoc/Modal";
import TagByName from "./components/utils/TagByName";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import Auth from "./components/shared/Auth";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      is_logged_in: false,
      is_admin: false,
      username: '',
      auth_modal_open: false,
    }

    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.logout = this.logout.bind(this);
    this.open_auth_modal = this.open_auth_modal.bind(this);
    this.close_auth_modal = this.close_auth_modal.bind(this);
  }

  componentDidMount() {
    this.update_logged_in();
    this.update_admin();

    this.setState({
      auth_modal: Modal(Auth, this.close_auth_modal)
    });
  }

  update_logged_in() {
    get_csrf().then((csrf) => {
      fetch('/api/user/isloggedin/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf
        }
      })
        .then((response) => {
          if(response.status === 200) {
            response.json()
              .then((result) => {
                this.setState({
                  is_logged_in: true,
                  is_admin: result.admin,
                  username: result.username
                })
              })
          }
        })
    })
  }

  update_admin() {
    get_csrf().then((csrf) => {
      fetch('/api/user/isadmin/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf
        }
      })
        .then((response) => {
          if(response.status === 200) {
            this.setState({is_admin: true});
          }
        })
    })
  }

  open_auth_modal() {
    this.setState({auth_modal_open: true});
  }

  close_auth_modal() {
    this.setState({auth_modal_open: false});
  }

  login(username) {
    this.setState({
      is_logged_in: true,
      username: username
    });

    this.update_admin();
  }

  register(username) {
    this.setState({
      is_logged_in: true,
      username: username
    })
  }

  logout() {
    get_csrf().then((csrf) => {
      fetch('/api/user/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf
        },
      })
        .then((response) => {
          this.setState({
            is_logged_in: false,
            username: ''
          })
        })
    })
  }

  render() {
    const AuthModal = this.state.auth_modal;

    return (
      <CookiesProvider>
        <Router>
          <div>
            <Helmet>
              <title>Рецепт Быстрого Приготовления</title>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width , initial-scale=1, shrink-to-fit=no" />
              <meta name="description" content="Быстрый поиск рецептов по заданным ингредиентам" />
              <meta property="og:title" content="Рецепт Быстрого Приготовления" />
              <meta property="og:description" content="Быстрый поиск рецептов по заданным ингредиентам" />
              <meta property="og:url" content="http://instantrecipe.ru/" />
            </Helmet>

            <Header
              isLoggedIn={this.state.is_logged_in}
              isAdmin={this.state.is_admin}
              username={this.state.username}
              logout={this.logout}
              openAuth={this.open_auth_modal}
            />

            <Switch>
              <Route exact path="/" render={() => (<Index cookies={this.props.cookies}/>)}/>
              <Route path="/about" render={() => (<About cookies={this.props.cookies}/>)} />
              <Route path="/recipes/:type/:search/:sort?" render={() => (<RecipeList cookies={this.props.cookies}/>)}/>
              <Route path="/recipe/details/:details" render={() => (<RecipeDetails cookies={this.props.cookies} is_logged_in={this.state.is_logged_in} openAuth={this.open_auth_modal}/>)} />
              <Route path="/tag_name/:name" render={() => (<TagByName cookies={this.props.cookies}/>)} />
              <Route path="/user/confirm/:token" render={() => (<UserConfirm cookies={this.props.cookies}/>)} />
              <Route path="/user/unconfirmed" render={() => (<Unconfirmed cookies={this.props.cookies}/>)} />
              <Route path="/user/restore/:token" render={() => (<PasswordRestoration cookies={this.props.cookies}/>)} />
              <Route path="/profile" render={() => (<Profile cookies={this.props.cookies} />)} />
              <Route path="/indev" render={() => (<Indev cookies={this.props.cookies} />)} />
              <Route path="/admin" render={() => (this.state.is_admin ? <Admin cookies={this.props.cookies} /> : <NotFound cookies={this.props.cookies} />)} />
              <Route render={() => (<NotFound cookies={this.props.cookies}/>)} />
            </Switch>

            <Footer />
            {this.state.auth_modal_open ? <AuthModal login={this.login} register={this.register} cookies={this.props.cookies} /> : null}
          </div>
        </Router>
      </CookiesProvider>
    )
  }
}

export default withCookies(App);
