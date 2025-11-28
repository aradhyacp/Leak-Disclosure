import './App.css'
import AppRoutes from './Routes/AppRoutes'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AppRoutes/>
    </ThemeProvider>
  )
}

export default App
