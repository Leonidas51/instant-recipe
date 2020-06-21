import React from "react";
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
        prevScrollPos: window.scrollY,
        header_class: prevState.prevScrollPos < window.scrollY && !prevState.header_open ? 'header_hidden' : ''
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
        <div className={`header__links ${this.state.header_open ? 'header__links_open' : ''}`}>
          <Link className="header__link" to="/">Главная</Link>
          {
            this.props.isLoggedIn
              ? <Link className="header__link" to="/suggest_recipe">Предложить рецепт</Link>
              : <Link className="header__link" to="/" onClick={this.props.openAuth}>Предложить рецепт</Link>
          }
          <Link className="header__link" to="/contacts">Контакты</Link>

          <div className="header__aside">
            {
              this.props.isLoggedIn && this.props.isAdmin
              ? <Link className="header__link" to="/admin">Админка</Link>
              : null
            }
            {
              this.props.isLoggedIn
                ? (<React.Fragment>
                    <Link className="header__link" to={`/profile/${this.props.userId}`}>{this.props.username}</Link>
                    <Link to="/" className="header__link" onClick={this.props.logout}>Выйти</Link>
                  </React.Fragment>)
                : (<React.Fragment>
                    <Link to="/" className="header__link" onClick={this.props.openAuth}>Войти</Link>
                  </React.Fragment>)
            }
          </div>
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
