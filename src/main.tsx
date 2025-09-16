import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './global.css'
import { Amplify } from 'aws-amplify'
import amplifyconfig from './amplifyconfiguration.json'
import { BrowserRouter } from 'react-router-dom'

Amplify.configure(amplifyconfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
