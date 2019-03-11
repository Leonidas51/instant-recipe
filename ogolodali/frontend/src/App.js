import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Recipe from "./pages/Recipe";
import Ingredient from "./pages/Ingredient";

class App extends React.Component {
  constructor(props) {
    super (props);
  }

  render() {
    return (
      <Router>
        <div>
          <Link to="/">Index</Link><br />
          <Link to="/about/">About</Link><br />
          <Link to="/recipes/">Recipes</Link><br />
          <Link to="/ingredients/">Ingredients</Link><br />
          <Link to="/bababab/">get 404</Link><br />

          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/about/" component={About} />
            <Route path="/recipes/" component={Recipe} />
            <Route path="/ingredients/" component={Ingredient} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;
