import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {throttle} from "../utils/";
import "./Header.css";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prevScrollPos: 0,
      header_class: ''
    }

    this.onScroll = throttle(this.onScroll.bind(this), 100);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll(e) {
    this.setState(prevState => {
      return {
        prevScrollPos: e.pageY,
        header_class: prevState.prevScrollPos < e.pageY ? 'header_hidden' : ''
      }
    })
  }

  render() {
    return (
      <div className={`header ${this.state.header_class}`}>
        <div className="header__logo"></div>
        <div className="header__links">
          <Link className="header__link" to="/">Главная</Link>
          <Link className="header__link" to="/about">О нас</Link>
          <Link className="header__link" to="/contacts">Контакты</Link>
        </div>
      </div>
    )
  }
}

export default Header;