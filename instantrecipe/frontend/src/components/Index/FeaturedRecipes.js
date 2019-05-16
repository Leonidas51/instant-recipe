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
      photo: 'kuritsa-s-ketchupom/1.png',
      id: 'abcd'
    },
    {
      name: 'Курица с майонезом',
      photo: 'kuritsa-s-mayonezom/1.png',
      id: 'efgh'
    }];
  }

  render() {
    return (
      <div className="featured-recipes">
        {this.state.featured.map((recipe) => {
          return (
            <div key={recipe.id} className="featured-recipes__container">
              {
                recipe.photo
                ? <img className="featured-recipes__image" src={require(`../../images/recipes/${recipe.photo}`)} />
                : <img className="featured-recipes__image" src={require(`../../images/recipes/default.png`)} />
              }
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