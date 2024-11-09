import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Collaborators from "./Collaborators";
import { CollaboratorDetails } from "./CollaboratorDetails";
import { getCurrentUserToken } from "../services/authService";
import axios from "axios";
import { API_BASE_URL } from "../constants";

interface HomeProps {
  isAdmin: boolean;
}

const Home: React.FC<HomeProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ [key: string]: any } | null>(
    null
  );

  const fetchUserDetails = async () => {
    const token = await getCurrentUserToken();
    if (token) {
      try {
        const response = await axios.get(API_BASE_URL + "/get_user_details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details", error);
      } finally {
      }
    } else {
      console.error("No ID token available");
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    } else {
      fetchUserDetails();
    }
  }, [auth.currentUser]);

  return (
    <div>
      {isAdmin ? (
        <Collaborators />
      ) : (
        userDetails && (
          <CollaboratorDetails
            handleSubmit={() => {}}
            dataFrame={userDetails}
            action="update"
            canDelete={false}
          />
        )
      )}
    </div>
  );
};

export default Home;
