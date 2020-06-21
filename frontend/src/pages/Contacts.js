import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Helmet } from "react-helmet";

function Contacts(props) {
  return (
      <React.Fragment>
        <Helmet>
          <title>Контакты - Рецепт Быстрого Приготовления</title>
        </Helmet>

        <div className="content-area content-area_contacts">
          <div className="highlighted-text">
            <div className="highlighted-text__body">
              Есть вопросы, пожелания, предложения? Нашли ошибку?<br />
              Пишите нам на <a className="link" href="mailto:instantreciperu@gmail.com">InstantRecipeRu@gmail.com</a>
            </div>
          </div>
        </div>
      </React.Fragment>
  );
}

export default Contacts;