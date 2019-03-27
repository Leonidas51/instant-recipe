import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecipeDetails from "./pages/RecipeDetails";
import RecipeList from "./pages/RecipeList";
import Header from "./components/Header";
import Footer from "./components/Footer";
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
          <Header />

          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/about" component={About} />
            <Route path="/recipes/:search" component={RecipeList} />
            <Route path="/recipe/details/:details" component={RecipeDetails} />
            <Route component={NotFound} />
          </Switch>

          <Footer />

        </div>
      </Router>
    )
  }
}

export default App;
