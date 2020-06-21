import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SearchArea from "../components/shared/SearchArea/SearchArea";
import FeaturedRecipes from "../components/Index/FeaturedRecipes";
import "./Index.css";

class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="content-area content-area_index">
        <div className="content-area__logo">
          Рецепт Быстрого Приготовления
        </div>
        <SearchArea showSample={true} showSettings={false} cookies={this.props.cookies} />
        <FeaturedRecipes />
        <div className="highlighted-text">
          <div className="highlighted-text__title">Добро пожаловать!</div>
          <div className="highlighted-text__body">
            Здесь вы можете найти быстрый рецепт по заданным вами ингредиентам. Начните вводить ингредиенты в поле сверху, а затем выберите подходящий из выпавшего списка. Можно добавить произвольное количество ингредиентов.<br />
            Желтая панель под строкой поиска позволяет выбрать вид поиска:
            <ul className="highlighted-text__list">
              <li>по ингредиентам</li>
              <li>по названию рецепта</li>
              <li>по тегам</li>
            </ul>
            Мы постараемся подобрать рецепты с наибольшим совпадением с выбранным вами списком, а на странице выдачи вы также сможете выбрать подходящий вам вид сортировки.
          </div>
        </div>
      </div>
    )
  }
}

export default Index;
