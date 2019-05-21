import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { CookiesProvider, withCookies } from 'react-cookie';
import {Helmet} from "react-helmet";
import "./reset.css";
import "./common.css";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecipeDetails from "./pages/RecipeDetails";
import RecipeList from "./pages/RecipeList";
import Auth from "./pages/Auth";
import TagByName from "./components/utils/TagByName";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
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

            <Header />

            <Switch>
              <Route exact path="/" render={() => (<Index cookies={this.props.cookies}/>)}/>
              <Route path="/about" render={() => (<About cookies={this.props.cookies}/>)} />
              <Route path="/recipes/:type/:search/:sort?" render={() => (<RecipeList cookies={this.props.cookies}/>)}/>
              <Route path="/recipe/details/:details" render={() => (<RecipeDetails cookies={this.props.cookies}/>)} />
              <Route path="/auth" render={() => (<Auth cookies={this.props.cookies} />)} />
              <Route path="/tag_name/:name" render={() => (<TagByName cookies={this.props.cookies}/>)} />
              <Route render={() => (<NotFound cookies={this.props.cookies}/>)} />
            </Switch>

            <Footer />

          </div>
        </Router>
      </CookiesProvider>
    )
  }
}

export default withCookies(App);
