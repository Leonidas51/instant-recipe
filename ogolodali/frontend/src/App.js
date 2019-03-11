import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import About from "./pages/About";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

class App extends React.Component {
  constructor(props) {
    super (props);
  }

  render() {
    return (  
      <Router>
        <div>
          <h1>оголодали</h1>
          <Link to="/">Index</Link><br />
          <Link to="/about/">About</Link><br />
          <Link to="/bababab/">404</Link><br />

          <Switch>
            <Route exact path="/" component={Index} />
            <Route path="/about/" component={About} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App;