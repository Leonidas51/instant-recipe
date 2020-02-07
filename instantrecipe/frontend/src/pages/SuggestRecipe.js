import React, {Component} from "react";
import RecipeEditor from "../components/shared/RecipeEditor";

class SuggestRecipe extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <RecipeEditor recipe_id={null} />
    )
  }
}

export default SuggestRecipe;