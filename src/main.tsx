import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './global.css'
import { Amplify } from 'aws-amplify'
import { BrowserRouter } from 'react-router-dom'
import { Authenticator } from '@aws-amplify/ui-react'
import amplifyconfig from './amplifyconfiguration.json'

Amplify.configure(amplifyconfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Authenticator.Provider>
  </React.StrictMode>,
)
