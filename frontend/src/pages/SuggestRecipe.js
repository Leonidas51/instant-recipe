import React from "react";
import RecipeEditor from "../components/shared/RecipeEditor";

class SuggestRecipe extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="content-area">
        <h1 className="page-title">Предложить рецепт</h1>
        <RecipeEditor />
      </div>
    )
  }
}

export default SuggestRecipe;