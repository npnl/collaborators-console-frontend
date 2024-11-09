import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import CompleteSignIn from "./components/CompleteSignIn";
import Admins from "./components/Admins";
import Collaborators from "./components/Collaborators";
import React, { useEffect, useState } from "react";
import { completeSignIn, getCurrentUser } from "./services/authService";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Home from "./components/Home";
import axios from "axios";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [isAdmin, setIsAdmin] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkIsAdmin = async () => {
      try {
        if (!auth.currentUser) {
          setIsAdmin(false);
        } else {
          const token = await auth.currentUser.getIdToken();
          const response = await axios.get(
            "http://enigmadatarequest.us-east-1.elasticbeanstalk.com/collaborators/check_admin_status",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200) {
            setIsAdmin(response.data.is_admin);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    if (!auth.currentUser) {
      setIsAdmin(false);
    } else {
      checkIsAdmin();
    }
  }, [auth.currentUser]);

  // Handle sign-in completion when the app loads
  useEffect(() => {
    const handleSignIn = async () => {
      try {
        await completeSignIn();
      } catch (error) {
        console.error("Error completing sign-in", error);
      }
    };

    handleSignIn();
  }, []);

  return (
    <Router>
      <Navbar isAdmin={isAdmin} />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/complete-sign-in" element={<CompleteSignIn />} />
          <Route path="/admins" element={<Admins />} />
          <Route path="/collaborators" element={<Collaborators />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
