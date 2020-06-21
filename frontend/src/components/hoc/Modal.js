import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./Modal.css";

function Modal(ModalBody, onClose) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.close = this.close.bind(this);
    }

    close(e) {
      if(!e.target.closest('.modal__body')) {
        onClose();
      }
    }

    render() {
      return(
        <div className='modal' onClick={this.close}>
          <div className="modal__body">
            <ModalBody {...this.props} close={onClose} />
          </div>
        </div>
      )
    }
  }
}

export default Modal;