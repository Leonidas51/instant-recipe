import React, {Component} from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function UploadRecipePhotoButton(props) {
  return (
    <div className="recipe-pic-upload-button">
      <div className="recipe-pic-upload-button__text">Загрузить фото</div>
    </div>
  )
}

export default UploadRecipePhotoButton;
