import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import BusinessProfile from "./pages/BusinessProfile"
import StudentProfile from "./pages/StudentProfile"
import Home from "./pages/home"
import Matches from './pages/Matches'
import Messages from './pages/messages'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/BusinessProfile" element= {<BusinessProfile/>} />
        <Route path="/StudentProfile" element= {<StudentProfile/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App