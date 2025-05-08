import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import LockIcon from "@mui/icons-material/Lock";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginIcon from "@mui/icons-material/Login";
import SecurityIcon from "@mui/icons-material/Security";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import {
  CHECK_PROJECT,
  REQUEST_PROJECT_ACCESS,
} from "../../utils/Project/Project";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderRadius: 20,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
  maxWidth: 600,
  margin: "0 auto",
  position: "relative",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  background:
    "linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))",
  backdropFilter: "blur(10px)",
}));

const BackgroundDecoration = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  right: 0,
  width: "350px",
  height: "350px",
  background: "linear-gradient(135deg, #6366F1, #7C3AED)",
  borderRadius: "0 0 0 100%",
  opacity: 0.1,
  zIndex: 0,
  transform: "translate(50px, -50px)",
}));

const BackgroundCircle = styled(Box)(() => ({
  position: "absolute",
  bottom: -50,
  left: -50,
  width: "200px",
  height: "200px",
  background: "linear-gradient(45deg, #EC4899, #F97316)",
  borderRadius: "50%",
  opacity: 0.07,
  zIndex: 0,
}));

const LockIconContainer = styled(Box)(({ theme }) => ({
  width: 90,
  height: 90,
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(135deg, rgba(111, 66, 193, 0.15), rgba(63, 81, 181, 0.15))",
  marginBottom: theme.spacing(3),
  boxShadow: "0 8px 16px rgba(111, 66, 193, 0.1)",
  border: "1px solid rgba(111, 66, 193, 0.2)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
    },
    "&.Mui-focused": {
      boxShadow: "0 4px 20px rgba(111, 66, 193, 0.15)",
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },
}));

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 12,
  padding: "12px 24px",
  fontWeight: 600,
  textTransform: "none",
  boxShadow:
    variant === "contained" ? "0 8px 20px rgba(111, 66, 193, 0.2)" : "none",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      variant === "contained"
        ? "0 12px 24px rgba(111, 66, 193, 0.25)"
        : "0 6px 16px rgba(111, 66, 193, 0.1)",
  },
}));

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  padding: "16px",
  "& .MuiAlert-icon": {
    fontSize: 24,
  },
  ...(severity === "success" && {
    background: "rgba(76, 175, 80, 0.08)",
    border: "1px solid rgba(76, 175, 80, 0.2)",
  }),
  ...(severity === "error" && {
    background: "rgba(211, 47, 47, 0.08)",
    border: "1px solid rgba(211, 47, 47, 0.2)",
  }),
  ...(severity === "info" && {
    background: "rgba(33, 150, 243, 0.08)",
    border: "1px solid rgba(33, 150, 243, 0.2)",
  }),
}));

const PermisionPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });

  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  // Check if project exists
  const { loading: checkingProject } = useQuery(CHECK_PROJECT, {
    variables: { projectId },
    onError: () => {
      setRequestStatus({
        status: "error",
        message: "Dự án không tồn tại hoặc đã bị xóa.",
      });
    },
  });

  // Request access mutation
  const [requestAccess, { loading: requesting }] = useMutation(
    REQUEST_PROJECT_ACCESS,
    {
      onCompleted: (data) => {
        setRequestStatus({
          status: "success",
          message: data.sendProjectAccessRequestEmail.RetMessgae,
        });
      },
      onError: (error) => {
        setRequestStatus({
          status: "error",
          message:
            error.message || "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.",
        });
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/project/${projectId}` } });
      return;
    }

    try {
      await requestAccess({
        variables: {
          projectId,
          message: message.trim() || undefined,
          nameRequest: user.name,
          imageRequest: user.picture,
          emailRequest: user.email,
        },
      });
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  const goToHome = () => {
    navigate("/");
  };

  if (checkingProject) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: theme.palette.primary.main }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography variant="body1" color="text.secondary">
            Đang kiểm tra thông tin dự án...
          </Typography>
        </motion.div>
      </Container>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: 6,
        background: "linear-gradient(135deg, #F5F7FA 0%, #E4E8F0 100%)",
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <StyledPaper elevation={6}>
            <BackgroundDecoration />
            <BackgroundCircle />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <LockIconContainer>
                <LockIcon
                  sx={{ fontSize: 45, color: theme.palette.primary.main }}
                />
              </LockIconContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  position: "relative",
                  background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Bạn không có quyền truy cập
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  textAlign: "center",
                  maxWidth: 450,
                  position: "relative",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                }}
              >
                Dự án này là riêng tư. Để truy cập, bạn cần được chủ sở hữu cấp
                quyền.
              </Typography>
            </motion.div>

            <Divider sx={{ width: "80%", mb: 4, opacity: 0.6 }} />

            {requestStatus.status === "success" ? (
              <Box sx={{ width: "100%", position: "relative" }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <StyledAlert
                    severity="success"
                    sx={{ mb: 3 }}
                    icon={<SecurityIcon fontSize="inherit" />}
                    action={
                      <StyledButton
                        color="inherit"
                        size="small"
                        onClick={goToHome}
                        startIcon={<ArrowBackIcon />}
                        variant="outlined"
                      >
                        Về trang chủ
                      </StyledButton>
                    }
                  >
                    {requestStatus.message ||
                      "Yêu cầu truy cập đã được gửi thành công!"}
                  </StyledAlert>
                </motion.div>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 4,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2,
                    }}
                  >
                    <Box
                      sx={{
                        background:
                          "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.2))",
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 8px 32px rgba(76, 175, 80, 0.2)",
                        border: "1px solid rgba(76, 175, 80, 0.3)",
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: 60, color: "#4caf50" }} />
                    </Box>
                  </motion.div>
                </Box>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 2, fontStyle: "italic" }}
                  >
                    Yêu cầu của bạn đã được gửi đi. Bạn sẽ nhận được thông báo
                    khi người chủ sở hữu cấp quyền.
                  </Typography>
                </motion.div>
              </Box>
            ) : (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%", position: "relative" }}
              >
                {requestStatus.status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <StyledAlert severity="error" sx={{ mb: 3 }}>
                      {requestStatus.message}
                    </StyledAlert>
                  </motion.div>
                )}

                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <StyledTextField
                        fullWidth
                        variant="outlined"
                        label="Lời nhắn cho chủ sở hữu dự án (không bắt buộc)"
                        multiline
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        sx={{ mb: 4 }}
                        placeholder="Tôi muốn tham gia dự án này vì..."
                        InputProps={{
                          sx: { fontSize: "1rem" },
                        }}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: isMobile ? "column" : "row",
                          mt: 2,
                        }}
                      >
                        <StyledButton
                          variant="outlined"
                          color="primary"
                          startIcon={<ArrowBackIcon />}
                          onClick={goToHome}
                          fullWidth={isMobile}
                        >
                          Quay lại trang chủ
                        </StyledButton>
                        <StyledButton
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={requesting}
                          fullWidth={isMobile}
                          startIcon={<PersonAddIcon />}
                        >
                          {requesting ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Yêu cầu truy cập"
                          )}
                        </StyledButton>
                      </Box>
                    </motion.div>
                  </>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <StyledAlert
                        severity="info"
                        sx={{ mb: 3 }}
                        icon={<LoginIcon fontSize="inherit" />}
                      >
                        Vui lòng đăng nhập để yêu cầu quyền truy cập vào dự án
                        này.
                      </StyledAlert>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexDirection: isMobile ? "column" : "row",
                          mt: 2,
                        }}
                      >
                        <StyledButton
                          variant="outlined"
                          color="primary"
                          startIcon={<ArrowBackIcon />}
                          onClick={goToHome}
                          fullWidth={isMobile}
                        >
                          Quay lại trang chủ
                        </StyledButton>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            navigate("/login", {
                              state: { from: `/project/${projectId}` },
                            })
                          }
                          fullWidth={isMobile}
                          startIcon={<LoginIcon />}
                        >
                          Đăng nhập
                        </StyledButton>
                      </Box>
                    </motion.div>
                  </Box>
                )}
              </Box>
            )}
          </StyledPaper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PermisionPage;
