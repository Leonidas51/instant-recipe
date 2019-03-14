import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Recipe from "./pages/Recipe";
import Ingredient from "./pages/Ingredient";

import RecipeList from "./pages/RecipeList";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/about" component={About} />
            <Route path="/recipes/:search" component={RecipeList} />
            <Route component={NotFound} />
          </Switch>

        {/*
          <Link to="/">Index</Link><br />
          <Link to="/about">About</Link><br />
          <Link to="/recipes">Recipes</Link><br />
        */}
        </div>
      </Router>
    )
  }
}

export default App;
