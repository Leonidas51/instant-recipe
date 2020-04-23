import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./UploadPhotoModal.css";
import {get_csrf} from "../../utils/";
import Loader from "../shared/Loader";

let close_timer;

class UploadPhotoModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      success: false,
      upload: null,
      error: ''
    }

    this.onInputChange = this.onInputChange.bind(this);
    this.submitPhoto = this.submitPhoto.bind(this);
  }

  onInputChange(e) {
    this.setState({
      upload: e.target.files[0]
    });
  }

  submitPhoto(e) {
    const data = new FormData();
    data.append('photo', this.state.upload);

    this.setState({loading: true})

    get_csrf().then((csrf) => {
      fetch(`/api/recipe/upload_photo/${this.props.recipe_id}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf
        },
        body: data
      })
        .then(response => {
          this.setState({loading: false});
          if(response.status === 200) {
            this.setState({success: true});
            close_timer = setTimeout(() => {
              this.props.close();
            }, 5000);
          } else if(response.status === 403) {
            this.setState({error: 'Для выполнения этого действия необходимо авторизоваться и подтвердить аккаунт'});
          } else {
            response.json()
              .then(result => {
                if(result.error) {
                  this.setState({error: result.error});
                } 
              })
              .catch(err => {
                this.setState({error: 'Произошла ошибка сервера. Пожалуйста, попробуйте позже.'});
              }) 
          }
        })
    })
  }

  componentWillUnmount() {
    clearTimeout(close_timer);
  }

  render() {
    let body;

    if(this.state.loading) {
      body = (
        <Loader />
      )
    } else if(this.state.success) {
      body = (
        <React.Fragment>
          <div className="upload-photo__title">Успешно!</div>
          <div className="upload-photo__info">Фото отправлено на рассмотрение.</div>
        </React.Fragment>
      )
    } else {
      body = (
        <React.Fragment>
          <h1 className="upload-photo__title">Предложитe фото для рецепта</h1>
          <input className="upload-photo__input" type="file" onChange={this.onInputChange} />
          <div className="upload-photo__info">Допускаются файлы форматов .png .jpg .jpeg и размером не более 5МБ</div>
          {this.state.error.length ? <div className="upload-photo__error">{this.state.error}</div> : null}
          <div className="upload-photo__confirm-container">
            <div className="upload-photo__confirm" onClick={this.submitPhoto}>
              <div className="button-confirm">Отправить</div>
            </div>
          </div>
        </React.Fragment>
      )
    }

    return (
      <div className="upload-photo">
        {body}
      </div>
    )
  }
}

export default UploadPhotoModal;