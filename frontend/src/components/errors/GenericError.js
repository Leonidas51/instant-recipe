import React from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

class GenericError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { has_error: false };
  }

  static getDerivedStateFromError(error) {
    return { has_error: true };
  }

  refresh() {
    this.setState({has_error: false});
  }

  render() {
    if (this.state.has_error) {
    return (
      <div className="content-area content-area_index">
        <p>Что-то пошло не так!</p>
        <p>Если проблема повторяется, напишите нам на <a className="link" href="mailto:instantreciperu@gmail.com">instantreciperu@gmail.com</a></p>
        <Link className="link" to="/" onClick={this.refresh.bind(this)}>Вернуться на главную</Link>
      </div>
    );
    }

    return this.props.children; 
  }
}

export default GenericError;