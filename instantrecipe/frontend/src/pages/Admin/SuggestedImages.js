import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {get_csrf} from "../../utils/";
import "./SuggestedImages.css";

class SuggestedImages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      images: []
    }

    this.onRejectClick = this.onRejectClick.bind(this);
    this.onAcceptClick = this.onAcceptClick.bind(this);
  }

  componentDidMount() {
    this.fetchImages();
  }

  fetchImages() {
    fetch('/api/admin/suggested_images')
      .then((response) => {
        if(response.status === 200) {
          response.json()
            .then((result) => {
              this.setState({images: result.uploads})
            })
        }
      })
  }

  rejectImage(image_id) {
    get_csrf().then((csrf) => {
      fetch('/api/admin/reject_image', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_id : image_id
        })
      })
        .then((response) => {
          if(response.status === 200) {
            this.fetchImages();
          } else {
            alert('Ошибка!');
          }
        })
    })
  }

  acceptImage(image_id) {
    get_csrf().then((csrf) => {
      fetch('/api/admin/accept_image', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_id : image_id
        })
      })
        .then((response) => {
          if(response.status === 200) {
            this.fetchImages();
          } else {
            alert('Ошибка!');
          }
        })
    })
  }

  onRejectClick(e) {
    if(confirm('Точно удалить?')) {
      this.rejectImage(e.target.dataset.imageId);
    }
  }

  onAcceptClick(e) {
    if(confirm('Точно сохранить?')) {
      this.acceptImage(e.target.dataset.imageId);
    }
  }

  render() {
    let images = null;

    if(this.state.images.length) {
      images = this.state.images.map((image, i) => {
        return (
          <div className="suggested-image" key={image._id}>
            <h2><Link className="suggested-image__recipe-name" to={`/recipe/details/${image.recipe_id}`}>{image.recipe_name}</Link></h2>
            <div className="suggested-image__image-container">
              <img className="suggested-image__image" src={`/images/recipes/upload/${image.recipe_id}/${image.path}`} />
            </div>
            <div className="suggested-image__sender">От: <Link className="link" to={`/user/${image.uploader_id}`}>{image.uploader_name}</Link></div>
            <div className="suggested-image__buttons">
              <div onClick={this.onRejectClick} data-image-id={image._id} className="suggested-image__button suggested-image__button_reject">Удалить</div>
              <div onClick={this.onAcceptClick} data-image-id={image._id} className="suggested-image__button suggested-image__button_accept">Сохранить</div>
            </div>
            <hr />
          </div>
        )
      })
    }

    return (
      <div className="content-area">
        {
          images
          ? images
          : <div>Здесь пока пусто...</div>
        }
      </div>
    );
  }
}

export default SuggestedImages;