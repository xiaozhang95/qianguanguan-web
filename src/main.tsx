import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'

import dayjs from 'dayjs'

import 'dayjs/locale/zh-cn'

import App from './App.tsx'
import store from './store'

dayjs.locale('zh-cn')

const root = createRoot(document.getElementById('root')!)
root.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
)
