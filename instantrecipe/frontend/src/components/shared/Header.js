import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import {throttle} from "../../utils/";
import "./Header.css";
import HeaderIcon from "../../icons/headermenu.svg";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prevScrollPos: 0,
      header_class: '',
      header_open: false
    }

    this.onScroll = throttle(this.onScroll.bind(this), 100);
    this.onIconClick = this.onIconClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if(this.props.location.pathname !== prevProps.location.pathname) {
      this.setState({
        header_open: false
      })
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  /* dom events */

  onScroll(e) {
    this.setState(prevState => {
      return {
        prevScrollPos: e.pageY,
        header_class: prevState.prevScrollPos < e.pageY && !prevState.header_open ? 'header_hidden' : ''
      }
    })
  }

  onIconClick(e) {
    this.setState({
      header_open: !this.state.header_open
    })
  }

  /* end dom events */

  render() {
    return (
      <div className={`header ${this.state.header_class}`}>
        <div className="header__logo"></div>
        <div className={`header__links ${this.state.header_open ? 'header__links_open' : ''}`}>
          <Link className="header__link" to="/">Главная</Link>
          <Link className="header__link" to="/about">О нас</Link>
          <Link className="header__link" to="/contacts">Контакты</Link>
        </div>
        <div className="header__menu-icon-container" onClick={this.onIconClick}>
          <svg className="header__menu-icon">
            <use xlinkHref="#headermenu" />
          </svg>
        </div>
      </div>
    )
  }
}

export default withRouter(Header);