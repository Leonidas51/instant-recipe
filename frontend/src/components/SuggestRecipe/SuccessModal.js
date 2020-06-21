import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function SuccessModal(props) {
  return (
    <React.Fragment>
      <div>Рецепт отправлен на рассмотрение!</div><br />
      <Link to="/" className="link">Вернуться на главную</Link>
    </React.Fragment>
  )
}

export default SuccessModal