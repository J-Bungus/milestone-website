import React, { setGlobal } from 'reactn';
import * as ReactDOM from 'react-dom';
import './index.css';
import App from './App';

setGlobal({
  openCartModal: false,
  userInfo: {
    id: undefined,
    business: "",
    name: "",
    address: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    created_at: undefined
  },
  token: ""
});

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals