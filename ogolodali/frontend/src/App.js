import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
//import Recipe from "./pages/Recipe";
import RecipeList from "./pages/RecipeList";
import "./reset.css";
import "./common.css";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <div>
          {/*
            header gang
          */}

          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/about" component={About} />
            <Route path="/recipes/:search" component={RecipeList} />
            <Route component={NotFound} />
          </Switch>

        {/*
          footer gang
        */}
        </div>
      </Router>
    )
  }
}

export default App;
