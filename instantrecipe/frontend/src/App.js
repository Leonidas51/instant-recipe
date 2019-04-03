import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { CookiesProvider, withCookies } from 'react-cookie';
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecipeDetails from "./pages/RecipeDetails";
import RecipeList from "./pages/RecipeList";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import "./reset.css";
import "./common.css";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CookiesProvider>
        <Router>
          <div>
            <Header />

            <Switch>
              <Route exact path="/" render={() => (<Index cookies={this.props.cookies}/>)}/>
              <Route path="/about" render={() => (<About cookies={this.props.cookies}/>)} />
              <Route path="/recipes/:search/:sort?" render={() => (<RecipeList cookies={this.props.cookies}/>)}/>
              <Route path="/recipe/details/:details" render={() => (<RecipeDetails cookies={this.props.cookies}/>)} />
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
