import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoutes from "./middleware/protectRoutes";
import GuestRoute from "./middleware/guestRoutes";
import Home from "./pages/Home";
import Header from "./components/Header";
import { useAuth } from "./context/authContext";
import CreateNote from "./pages/CreateNote";
import UserProfile from "./pages/UserProfile";
import MyNotes from "./pages/MyNotes"


function App() {
  const { accessToken } = useAuth();

  return (
    <div className="">
      {accessToken && <Header></Header>}
      <Routes>
        <Route path="/" element={<ProtectedRoutes><Home></Home></ProtectedRoutes>}></Route>
        
        <Route path="/:username" element={<ProtectedRoutes><UserProfile></UserProfile></ProtectedRoutes>}></Route>

        <Route path="/my-notes" element={<ProtectedRoutes><MyNotes></MyNotes></ProtectedRoutes>}></Route>

        <Route path="/create-note" element={<ProtectedRoutes><CreateNote></CreateNote></ProtectedRoutes>}></Route>
        <Route path="/login" element={<GuestRoute><Login></Login></GuestRoute>}></Route>
        <Route path="/signup" element={<GuestRoute><Signup></Signup></GuestRoute>}></Route>
       
      </Routes>
      
    </div>
  )
}

export default App