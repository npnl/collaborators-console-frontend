import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Button, Form } from "react-bootstrap";
import { getCurrentUser, getCurrentUserToken } from "../services/authService";
import { auth } from "../firebaseConfig";
import { API_BASE_URL } from "../constants";

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      const token = await getCurrentUserToken();
      try {
        const response = await axios.get(API_BASE_URL + "/get_admins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        setAdmins(response.data.admins);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    if (auth.currentUser) {
      fetchAdmins();
      console.log("fetching admins", auth.currentUser);
    }
  }, [auth.currentUser]);

  const handleAddClick = () => {
    setIsAddingAdmin(true);
  };

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdminEmail(e.target.value);
  };

  const handleNewAdminBlur = async () => {
    if (!newAdminEmail.trim()) {
      setIsAddingAdmin(false);
      return;
    }
  };
  const handleDeleteAdmin = async (email: string) => {
    if (!getCurrentUser()) {
      navigate("/login");
      return;
    }
    const token = await getCurrentUserToken();

    try {
      await axios.post(
        "/delete_admin",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAdmins(admins.filter((adminEmail) => adminEmail !== email));
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  return (
    <div>
      <h2>Admins</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th style={{ width: "50px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((email) => (
            <tr key={email}>
              <td>{email}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteAdmin(email)}
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
          {isAddingAdmin && (
            <tr>
              <td>
                <Form.Control
                  type="email"
                  value={newAdminEmail}
                  onChange={handleNewAdminChange}
                  onBlur={handleNewAdminBlur}
                  placeholder="Enter admin email"
                  autoFocus
                />
              </td>
              <td></td>
            </tr>
          )}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleAddClick}>
        ➕ Add Admin
      </Button>
    </div>
  );
};

export default Admins;
