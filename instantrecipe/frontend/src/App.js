import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { CookiesProvider, withCookies } from 'react-cookie';
import {Helmet} from "react-helmet";
import {get_csrf} from "./utils/"
import "./reset.css";
import "./common.css";
import Contacts from "./pages/Contacts";
import Unconfirmed from "./pages/Unconfirmed";
import PasswordRestoration from "./pages/PasswordRestoration";
import UserConfirm from "./pages/UserConfirm";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecipeDetails from "./pages/RecipeDetails";
import RecipeList from "./pages/RecipeList";
import Profile from "./pages/Profile";
import SuggestRecipe from "./pages/SuggestRecipe";
import AdminPage from "./pages/Admin/AdminPage";
import Modal from "./components/hoc/Modal";
import TagByName from "./components/utils/TagByName";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import Auth from "./components/shared/Auth";
import SuggestedImages from "./pages/Admin/SuggestedImages";
import SuggestedRecipes from "./pages/Admin/SuggestedRecipes";
import RecipeEditorPage from "./pages/Admin/RecipeEditorPage";
import GenericError from "./components/errors/GenericError";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      is_logged_in: false,
      is_admin: false,
      username: '',
      user_id: '',
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
                  username: result.username,
                  user_id: result.user_id
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

  open_auth_modal(e) {
    e.preventDefault();
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

    this.update_logged_in();
    this.update_admin();
  }

  register(username) {
    this.setState({
      is_logged_in: true,
      username: username
    })

    this.update_logged_in();
  }

  logout(e) {
    e.preventDefault();
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
            is_admin: false,
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
              userId={this.state.user_id}
              logout={this.logout}
              openAuth={this.open_auth_modal}
            />

            <GenericError>
              <Switch>
                    <Route exact path="/" render={() => (<Index cookies={this.props.cookies}/>)}/>
                    <Route path="/contacts" render={() => (<Contacts cookies={this.props.cookies}/>)} />
                    <Route path="/recipes/:type/:search/:sort?" render={() => (<RecipeList cookies={this.props.cookies}/>)}/>
                    <Route path="/recipe/details/:details" render={() => (<RecipeDetails cookies={this.props.cookies} is_logged_in={this.state.is_logged_in} is_admin={this.state.is_admin} openAuth={this.open_auth_modal}/>)} />
                    <Route path="/tag_name/:name" render={() => (<TagByName cookies={this.props.cookies}/>)} />
                    <Route path="/user/confirm/:token" render={() => (<UserConfirm cookies={this.props.cookies}/>)} />
                    {/*<Route path="/user/unconfirmed" render={() => (<Unconfirmed cookies={this.props.cookies}/>)} />*/}
                    <Route path="/user/restore/:token" render={() => (<PasswordRestoration cookies={this.props.cookies}/>)} />
                    <Route path="/profile/:user_id" render={() => (<Profile cookies={this.props.cookies} is_logged_in={this.state.is_logged_in} />)} />
                    <Route path="/suggest_recipe" render={() => (<SuggestRecipe cookies={this.props.cookies} />)} />
                    <Route path="/indev" render={() => (<Indev cookies={this.props.cookies} />)} />
                    <Route exact path="/admin" render={() => (this.state.is_admin ? <AdminPage cookies={this.props.cookies} /> : <NotFound cookies={this.props.cookies} />)} />
                    <Route path="/admin/suggested_images" render={() => (this.state.is_admin ? <SuggestedImages cookies={this.props.cookies} /> : <NotFound cookies={this.props.cookies} />)} />
                    <Route path="/admin/suggested_recipes" render={() => (this.state.is_admin ? <SuggestedRecipes cookies={this.props.cookies} /> : <NotFound cookies={this.props.cookies} />)} />
                    <Route path="/admin/recipe_editor/:recipe_id?" render={() => (this.state.is_admin ? <RecipeEditorPage cookies={this.props.cookies} /> : <NotFound cookies={this.props.cookies} />)} />
                    <Route render={() => (<NotFound cookies={this.props.cookies}/>)} />
                </Switch>
              </GenericError>

            <Footer isLoggedIn={this.state.is_logged_in} openAuth={this.open_auth_modal} />
            {this.state.auth_modal_open ? <AuthModal login={this.login} register={this.register} cookies={this.props.cookies} /> : null}
          </div>
        </Router>
      </CookiesProvider>
    )
  }
}

export default withCookies(App);
