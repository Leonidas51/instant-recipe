import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import Loader from "../shared/Loader";

class TagByName extends React.Component {
  componentDidMount() {
    fetch(`/api/tag/${this.props.match.params.name}`)
      .then(response => {
        response.json()
          .then(result => {
            this.props.history.replace(`/recipes/by_tags/${result._id}/${(this.props.cookies.get('by_tags_sort') || 'timeasc')}`);
          })
      })
  }

  render() {
    return(
      <div className="content-area">
        <Loader />
      </div>
    )
  }
}

export default withRouter(TagByName);