import { useState } from "react";
import { GoPlus } from "react-icons/go";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setProjectName("");
    setProjectDescription("");
  };

  const handleCreateProject = () => {
    console.log("Project Created:", {
      name: projectName,
      description: projectDescription,
    });
    handleClose();
  };

  return (
    <>
      <aside className="fixed z-10 left-0 top-0 bg-gradient-to-b from-gray-800 to-gray-900 h-full w-16 text-white flex flex-col items-center p-4">
        <button
          onClick={handleClickOpen}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-lg transition duration-300 ease-in-out"
        >
          <GoPlus size={24} />
        </button>
      </aside>

      <Dialog open={open} onClose={handleClose} className="p-4">
        <DialogTitle className="text-lg font-semibold">
          Create New Project
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Project Name"
              type="text"
              fullWidth
              variant="outlined"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-gray-100 border-gray-300 rounded-md"
            />
            <TextField
              margin="dense"
              id="description"
              label="Project Description"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="bg-gray-100 border-gray-300"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            className="text-gray-700 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
