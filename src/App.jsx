import { Slide, ToastContainer } from "react-toastify"
import AppRouter from "./router/AppRouter"
import axios from "axios"
import { NotificationProvider } from "./context/NotificationContext"
import { ThemeProvider } from "./context/ThemeContext"

function App() {

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppRouter></AppRouter>
      </NotificationProvider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
    </ThemeProvider>
  )
}

export default App
