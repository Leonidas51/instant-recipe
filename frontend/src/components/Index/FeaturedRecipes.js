import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { DIST_PATH } from "../../common/constants";

class FeaturedRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      featured_loaded: false,
      featured: []
    }
    this.fetchFeatured = this.fetchFeatured.bind(this);
  }

  componentDidMount() {
    this.fetchFeatured();
  }

  fetchFeatured() {
    fetch('/api/recipe/get_featured/')
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Рецепты не найдены"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setState({
                featured_loaded: true,
                featured: result
              });
            },
            (error) => {
              this.setState({
                featured_loaded: true,
                error: error
              });
            }
          )
          .catch((err) => {
            console.error('error while converting to json: ' + err);
          });
    })
    .catch((err) => {
      console.error('error while fetching: ' + err);
    });
  }

  render() {
    return (
        <div className="featured-recipes">
          {
            this.state.featured_loaded && !this.state.error ?
              this.state.featured.map((recipe) => {
                return (
                  <div key={recipe._id} className="featured-recipes__container">
                    <img className="featured-recipes__image" src={`${DIST_PATH}${recipe._id}/`} />
                    <div className="featured-recipes__name">
                      <Link className="featured-recipes__link" to={`/recipe/details/${recipe._id}/`}> {recipe.name} </Link>
                    </div>
                  </div>
                )
              }) :
              null
          }
        </div>
      )
  }
}

export default FeaturedRecipes;
