import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area">
        <Link className="link" to="/admin/suggested_images">Предложенные фотографии</Link><br />
        <Link className="link" to="/admin/suggested_recipes">Предложенные рецепты</Link><br />
        <Link className="link" to="/admin/recipe_editor">Редактор рецептов</Link>
      </div>
    );
  }
}

export default AdminPage;