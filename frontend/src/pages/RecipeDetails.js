import React from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import NotFound from "./NotFound";
import ScrollToTop from "../components/utils/ScrollToTop";
import Loader from "../components/shared/Loader";
import "./RecipeDetails.css";
import Modal from "../components/hoc/Modal";
import UploadPhotoModal from "../components/RecipeDetails/UploadPhotoModal";
import FacebookIcon from "../icons/social/facebook.svg";
import VkIcon from "../icons/social/vk.svg";
import TwitterIcon from "../icons/social/twitter.svg";
import TelgramIcon from "../icons/social/telegram.svg";
import OKIcon from "../icons/social/odnoklassniki.svg";
import StarIcon from "../icons/star.svg";
import HeartIcon from "../icons/heart.svg";
import { DIST_PATH } from "../common/constants";

const difficulty = [
  {text:'элементарно',color:'#4EC44B'},
  {text:'легко',color:'#ADC741'},
  {text:'не так уж и легко',color:'#CEC830'},
  {text:'придется попотеть',color:'#C4A24B'},
  {text:'сложно',color:'#DC622D'},
  {text:'очень сложно',color:'#951010'}
]

class RecipeDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      recipe_loaded: false,
      recipe: {},
      recipe_rating: 0,
      is_favorite: false,
      is_liked: false,
      modal_upload_photo_open: false
    };

    this.openUploadPhotoModal = this.openUploadPhotoModal.bind(this);
    this.closeUploadPhotoModal = this.closeUploadPhotoModal.bind(this);
    this.onFavoriteClick = this.onFavoriteClick.bind(this);
    this.onLikeClick = this.onLikeClick.bind(this);
    this.onShareClick = this.onShareClick.bind(this);
  }

  componentDidMount() {
    this.fetchRecipe();
    this.fetchRecipeUserData();
  }

  componentDidUpdate(prevProps) {
    if(this.props.is_logged_in !== prevProps.is_logged_in) {
      this.fetchRecipeUserData();
    }
  }

  openUploadPhotoModal(e) {
    if(!this.props.is_logged_in) {
      this.props.openAuth(e);
      return;
    }

    this.setState({modal_upload_photo_open: true});
  }

  closeUploadPhotoModal() {
    this.setState({modal_upload_photo_open: false});
  }

  onFavoriteClick(e) {
    if(!this.props.is_logged_in) {
      this.props.openAuth(e);
      return;
    }

    if(!this.state.is_favorite) {
      this.addToFavorites();
    } else {
      this.removeFromFavorites();
    }

    this.setState({is_favorite: !this.state.is_favorite});
  }

  onLikeClick(e) {
    if(!this.props.is_logged_in) {
      this.props.openAuth(e);
      return;
    }

    if(!this.state.is_liked) {
      this.addToLiked();
      this.setState({recipe_rating: this.state.recipe_rating + 1});
    } else {
      this.removeFromLiked();
      this.setState({recipe_rating: this.state.recipe_rating - 1});
    }

    this.setState({is_liked: !this.state.is_liked});
  }

  addToLiked() {
    fetch(`/api/recipe/add_to_liked/${this.state.recipe._id}`)
    .then(response => {
      if(response.status !== 200) {
        alert('Произошла ошибка сервера. Пожалуйста, попробуйте позже.')
      }

      this.fetchRecipeUserData();
    })
  }

  removeFromLiked() {
    fetch(`/api/recipe/remove_from_liked/${this.state.recipe._id}`)
    .then(response => {
      if(response.status !== 200) {
        alert('Произошла ошибка сервера. Пожалуйста, попробуйте позже.')
      }

      this.fetchRecipeUserData();
    })
  }

  addToFavorites() {
    fetch(`/api/recipe/add_to_favorites/${this.state.recipe._id}`)
      .then(response => {
        if(response.status !== 200) {
          alert('Произошла ошибка сервера. Пожалуйста, попробуйте позже.')
        }

        this.fetchRecipeUserData();
      })
  }

  removeFromFavorites() {
    fetch(`/api/recipe/remove_from_favorites/${this.state.recipe._id}`)
      .then(response => {
        if(response.status !== 200) {
          alert('Произошла ошибка сервера. Пожалуйста, попробуйте позже.')
        }

        this.fetchRecipeUserData();
      })
  }

  onShareClick(e) {
    switch(e.target.dataset.sharer) {
      case 'vk':
        window.open("http://vk.com/share.php?url=" + window.location + "&title=" + encodeURI(this.state.recipe.name + " - Рецепт Быстрого Приготовления"), '_blank')
        break;
      case 'fb':
        window.open("http://www.facebook.com/sharer/sharer.php?u=" + window.location,'_blank');
        break;
      case 'ok':
        window.open("https://connect.ok.ru/offer?url=" + window.location + "&title=" + encodeURI(this.state.recipe.name + " - Рецепт Быстрого Приготовления"),'_blank');
        break;
      case 'tw':
        window.open("http://twitter.com/share?url=" + window.location + "&text=" + encodeURI(this.state.recipe.name + " - Рецепт Быстрого Приготовления"),'_blank');
        break;
      case 'tg':
        window.open("tg://msg?text=" + encodeURI(this.state.recipe.name + " - Рецепт Быстрого Приготовления: ") + window.location,'_blank');
        break;

    }
  }

  parseServes(serves) {
    let serves_word;

    if(serves === 1) {
      serves_word = 'порцию';
    } else if(serves > 1 && serves < 5) {
      serves_word = 'порции';
    } else {
      serves_word = 'порций';
    }

    return `${serves} ${serves_word}`;
  }

  parseInstructions(text) {
    return text.split('\n').map((step,i) => {
      return <div className="recipe-instructions__step" key={i}>{step}</div>
    })
  }

  fetchRecipe() {
    fetch(`/api/recipe/${this.props.match.params.details}/`)
    .then((response) => {
      if(response.status === 204) {
        this.setState({error: {message: "Кажется, такого рецепта у нас нет!"}});
      } else
        response.json()
          .then(
            (result) => {
              this.setIngredientEntries(result);
              this.setState({
                recipe_loaded: true,
                recipe: result
              });
              this.parseInstructions(result.instructions_source);
            },
            (error) => {
              this.setState({
                recipe_loaded: true,
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

  fetchRecipeUserData() {
    fetch(`/api/recipe/user_data/${this.props.match.params.details}/`)
    .then((response) => {
      if(response.status === 200) {
        response.json()
          .then(
            (result) => {
              this.setState({
                is_favorite: result.favorite,
                is_liked: result.liked,
                recipe_rating: result.rating
              })
            }
          )
      } else {
        alert('Произошла ошибка сервера. Пожалуйста, попробуйте позже.');
      }
    })
  }

  setIngredientEntries(recipe) {
    recipe.ingredient_names.mandatory = Object.entries(recipe.ingredient_names.mandatory);
    recipe.ingredient_names.optional = Object.entries(recipe.ingredient_names.optional);
  }

  render() {
    const { error, recipe_loaded, recipe } = this.state;

    const UploadModal = Modal(UploadPhotoModal, this.closeUploadPhotoModal);

    let difficulty_style = {};

    if(!this.state.recipe_loaded) {
      return(
        <React.Fragment>
          <Helmet>
            <title>Рецепт Быстрого Приготовления</title>
            <meta property="og:description" content="Рецепт Быстрого Приготовления" />
          </Helmet>

          <div className="content-area content-area_recipe-details">
            <Loader text="Загружаем рецепт..."/>
          </div>
        </React.Fragment>
      )
    }

    if(error) {
      return(
        <NotFound />
      )
    } else if(recipe_loaded) {
      difficulty_style = {
        backgroundColor: difficulty[this.state.recipe.difficulty - 1].color
      }
    }

    return (
      <React.Fragment>
      <Helmet>
        {
          !error
            ? <title>{recipe.name} - Рецепт Быстрого Приготовления</title>
            : <title>Рецепт Быстрого Приготовления</title>
        }

        {
          !error
            ? <meta property="og:title" content={recipe.name} />
            : null
        }
        
        <meta property="og:description" content="Рецепт Быстрого Приготовления" />
      </Helmet>

      <div className="content-area content-area_recipe-details">
        <ScrollToTop />
        <div className="recipe-top-container">
          {/*<div className="recipe-pic-container">
          {
            this.state.recipe_loaded
            ? <img className="recipe-pic" src={`${DIST_PATH}${this.state.recipe._id}/`} />
            : null
          }
          
          </div>*/}
          <div className="recipe-main">
            <div className="recipe-main__title">{ this.state.recipe.name }</div>
              {
                this.props.is_admin
                ? (<div>
                    <Link className="link" to={encodeURI(`/admin/recipe_editor/${recipe._id}`)} target="blank">Открыть в редакторе</Link>
                  </div>)
                : null
              }
            <div className="recipe-main__tags">
              {
                this.state.recipe.tag_names.map((tag, i) => {
                  if(this.state.recipe.tag_names[i+1]) {
                    return (
                      <span key={this.state.recipe.tag_ids[i]}>
                        <Link to={encodeURI(`/tag_name/${tag}`)} className="recipe-main__tag-name">{ tag }</Link>,&nbsp;
                      </span>
                    )
                  } else {
                    return (
                      <span key={this.state.recipe.tag_ids[i]}>
                        <Link to={encodeURI(`/tag_name/${tag}`)} className="recipe-main__tag-name">{ tag }</Link>
                      </span>
                    )
                  }
                })
              }
            </div>
            <div className="recipe-characteristics">
              <div className="recipe-characteristics__item">
                <div className="recipe-characteristics__value recipe-characteristics__time-value">
                  {this.state.recipe.cooking_time}
                </div>
              </div>
              <div className="recipe-characteristics__item">
                <div style={difficulty_style} className="recipe-characteristics__value recipe-characteristics__difficulty-value">
                  {difficulty[this.state.recipe.difficulty - 1].text}
                </div>
              </div>
              {/*<div className="recipe-characteristics__item">
                <div className="button-confirm" onClick={this.onFavoriteClick}>Добавить в избранное</div>
              </div>*/}
              {/*<div className="recipe-characteristics__item">
                <div className="recipe-characteristics__text">
                  Оценка:
                </div>
                <div className="recipe-characteristics__rating-container">
                  <div className="recipe-characteristics__rating-button recipe-characteristics__rating-minus">
                    -
                  </div>
                  <div className="recipe-characteristics__rating-value">
                    {
                      this.state.recipe_loaded ?
                      this.state.recipe.rating
                      : null
                    }
                  </div>
                  <div className="recipe-characteristics__rating-button recipe-characteristics__rating-plus">
                    +
                  </div>
                </div>
              </div>*/}
            </div>
          </div>
          <div className="ingredients-container">
            <div className="ingredients__mandatory">
              <p className="ingredients__title">Ингредиенты на {this.parseServes(this.state.recipe.serves)}:</p>
              <div className="ingredients__list">
                {
                  this.state.recipe.ingredient_names.mandatory.map((val, i) => {
                    return (
                      /* i will refactor this eventually i'm just not in the mood */
                      <p key={i}>
                        {i + 1}. {val[0][0].toUpperCase() + val[0].slice(1)} {val[1]}
                      </p>
                    )
                  })
                }
              </div>
            </div>
            {
              this.state.recipe.ingredient_names.optional.length ?
                <div className="ingredients__additional">
                  <p className="ingredients__subtitle">Можно добавить:</p>
                  <div className="ingredients__list">
                    {
                      this.state.recipe.ingredient_names.optional.map((val, i) => {
                        return (
                          <p key={i}>{i + 1}. {val[0][0].toUpperCase() + val[0].slice(1)} {val[1]}</p>
                        );
                      })
                    }
                  </div>
                </div>
                : null
            }
        </div>
        </div>
        
        <div className="recipe-instructions">
          <div className="section-title">Инструкции</div>
            <div className="recipe-instructions__main">
              
              {
                this.state.recipe.has_image
                ? (
                    <div className="recipe-pic-container">
                      <img className="recipe-pic" src={`${DIST_PATH}${this.state.recipe._id}/`} />
                    </div>
                  )
                : null
              }
              <div className="recipe-instructions__list">
                {this.parseInstructions(this.state.recipe.instructions_source)}
              </div>
            </div>
        </div>
        <div className="recipe-source">
          <p>
          {this.state.recipe.author.length ? "Автор: " + this.state.recipe.author : ""}
          </p>
        </div>
        
        <div className="recipe-interaction">
          <div className="recipe-interaction__buttons">
            <div className="button-confirm" onClick={this.openUploadPhotoModal}>Предложить фото</div>
            <div className={this.state.is_favorite ? "recipe-interaction__button recipe-interaction__button_active" : "recipe-interaction__button"} onClick={this.onFavoriteClick}>
              <svg className="recipe-interaction__button-icon"><use className="recipe-interaction__button-svg recipe-interaction__button-svg_star" xlinkHref="#star" /></svg>
              <div className="recipe-interaction__tooltip-wrap">
                <div className="recipe-interaction__tooltip">Добавить в Избранное</div>
              </div>
            </div>
            <div className={this.state.is_liked ? "recipe-interaction__button recipe-interaction__button_active" : "recipe-interaction__button"} onClick={this.onLikeClick}>
              {
                this.state.recipe_rating > 0
                ? <span className="recipe-interaction__button-like-counter">{this.state.recipe_rating}</span>
                : null
              } 
              <svg className="recipe-interaction__button-icon"><use className="recipe-interaction__button-svg recipe-interaction__button-svg_heart" xlinkHref="#heart" /></svg>
              <div className="recipe-interaction__tooltip-wrap">
                <div className="recipe-interaction__tooltip">Мне нравится</div>
              </div>
            </div>
          </div>
          <div className="recipe-interaction__share">
            <div className="recipe-interaction__share-list">
              <svg className="recipe-interaction__share-icon"><use data-sharer="vk" onClick={this.onShareClick} xlinkHref="#vk" /></svg>
              <svg className="recipe-interaction__share-icon"><use data-sharer="fb" onClick={this.onShareClick} xlinkHref="#facebook" /></svg>
              <svg className="recipe-interaction__share-icon"><use data-sharer="tw" onClick={this.onShareClick} xlinkHref="#twitter" /></svg>
              <svg className="recipe-interaction__share-icon"><use data-sharer="ok" onClick={this.onShareClick} xlinkHref="#odnoklassniki" /></svg>
            </div>
        </div>
        </div>
        {/*<div className="comment-section">
          <div className="section-title">
            Комментарии
            <div className="comment-section__content">
            </div>
          </div>
        </div>*/}
      </div>
      {this.state.modal_upload_photo_open ? <UploadModal recipe_id={this.state.recipe._id} cookies={this.props.cookies} /> : null}
      </React.Fragment>
    );
  }
}

export default withRouter(RecipeDetails);
