import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class FeaturedRecipes extends React.Component {
  constructor(props) {
    super(props);

    this.state = ({featured: this.fetchFeatured()});
  }

  fetchFeatured() {
    /* используем воображение */
    return [{
      name: 'Курица с кетчупом',
      path: 'kuritsa-s-ketchupom',
      id: 'abcd'
    },
    {
      name: 'Курица с майонезом',
      path: 'kuritsa-s-mayonezom',
      id: 'efgh'
    }];
  }

  render() {
    return (
      <div className="featured-recipes">
        {this.state.featured.map((recipe) => {
          return (
            <div key={recipe.id} className="featured-recipes__container">
              <img className="featured-recipes__image" src={require(`../images/${recipe.path}/1.png`)} />
              <div className="featured-recipes__name">
                <Link className="featured-recipes__link" to={`/recipe/${recipe.id}/`}> {recipe.name} </Link>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

export default FeaturedRecipes;