import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./Loader.css";

class Loader extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {text} = this.props,
          text_mod = this.props.negative ? 'loader__text_negative' : '',
          spinner_mod = this.props.negative ? 'loader__spinner_negative' : '';

    return(
      <div className="loader">
        <div className={`loader__spinner ${spinner_mod}`}></div>
        {
          text ? (
            <div className={`loader__text ${text_mod}`}>
              {text}
            </div>
          ) : null
        }
      </div>
    )
  }
}

export default Loader;