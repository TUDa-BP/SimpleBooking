import "bootstrap/scss/bootstrap.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import './style/main.scss'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle';
import 'animate.css';


import "bootstrap/dist/css/bootstrap.css"
import "bootstrap/dist/js/bootstrap.js"

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.provide('bootstrap', bootstrap);

app.mount('#app')

