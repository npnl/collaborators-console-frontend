import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import CustomDataTable from "./CustomDataTable";
import axios from "axios";
import { getCurrentUserToken } from "../services/authService";
import { DataFrame, Row } from "../types/DataTypes";
import { CollaboratorDetails } from "./CollaboratorDetails";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { API_BASE_URL } from "../constants";

const Collaborators: React.FC = () => {
  const [data, setData] = useState<DataFrame>([]);
  const [selectedData, setSelectedData] = useState<{
    [key: string]: any;
  } | null>(null);
  const [action, setAction] = useState<"add" | "update" | null>(null);
  const navigate = useNavigate();

  const fetchCollaborators = async () => {
    if (!auth.currentUser) {
      navigate("login");
      return;
    }
    const token = await getCurrentUserToken();
    try {
      const response = await axios.get(
        API_BASE_URL + "/get_all_collaborators",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    }
  };

  useEffect(() => {
    setSelectedData(null);
    setAction(null);
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      fetchCollaborators();
    }
  }, [auth.currentUser]);

  const handleRowClick = (selected: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: Row[];
  }) => {
    if (selected.selectedRows.length > 0) {
      const selectedIndex = selected.selectedRows[0].index;
      const record = data.find((item) => item.index === selectedIndex);
      if (record) {
        setSelectedData(record);
        setAction("update");
      }
    } else {
      setSelectedData(null);
      setAction(null);
    }
  };

  const handleAddCollaborator = () => {
    setSelectedData({});
    setAction("add");
  };

  const handleUpdate = () => {
    fetchCollaborators();
    setSelectedData(null);
    setAction(null);
  };

  const handleBack = () => {
    setSelectedData(null);
    setAction(null);
  };

  return (
    <div>
      {selectedData ? (
        <>
          <Button variant="link" onClick={handleBack} className="mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-arrow-left-circle-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
            </svg>
            {"  "}
            Back
          </Button>
          <CollaboratorDetails
            handleSubmit={handleUpdate}
            dataFrame={selectedData}
            action={action}
            canDelete={true}
          />
        </>
      ) : (
        <>
          <div className="d-flex justify-content-between flex-row-reverse mb-3">
            <Button variant="primary" onClick={handleAddCollaborator}>
              Add Collaborator
            </Button>
          </div>
          <CustomDataTable
            dataFrame={data}
            title="Collaborators"
            showControls={true}
            paginate={true}
            selectable={true}
            columnNames={[
              "first_name",
              "last_name",
              "email",
              "University/Institute",
            ]}
            onSelect={handleRowClick}
          />
        </>
      )}
    </div>
  );
};

export default Collaborators;
