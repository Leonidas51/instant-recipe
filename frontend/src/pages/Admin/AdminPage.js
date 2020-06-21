import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class AdminPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      admin_data: {}
    }
  }

  componentDidMount() {
    fetch('/api/admin/get_admin_page_data')
      .then(response => {
        if(response.status === 200) {
          response.json()
            .then(result => {
              this.setState({admin_data: result.data});
            })
        } else {
          alert('Ошибка получения метаданных');
        }
      })
  }

  render() {
    const images = this.state.admin_data.pending_images || 0,
          recipes = this.state.admin_data.pending_recipes || 0

    return (
      <div className="content-area">
        <Link className="link" to="/admin/suggested_images">Предложенные фотографии {images ? '(' + images +')' : null}</Link><br />
        <Link className="link" to="/admin/suggested_recipes">Предложенные рецепты {recipes ? '(' + recipes + ')' : null}</Link><br />
        <Link className="link" to="/admin/recipe_editor">Редактор рецептов</Link>
      </div>
    );
  }
}

export default AdminPage;