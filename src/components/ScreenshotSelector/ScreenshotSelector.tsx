import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { alpha, useTheme } from '@mui/material/styles';

interface ScreenshotSelectorProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const ScreenshotSelector: React.FC<ScreenshotSelectorProps> = ({ 
  onClose, 
  onCapture,
  canvasRef
}) => {
  const theme = useTheme();
  const [isSelecting, setIsSelecting] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    setStartX(e.clientX - rect.left); // 300
    setStartY(e.clientY - rect.top); // 300
    setEndX(e.clientX - rect.left); // 300
    setEndY(e.clientY - rect.top); // 300
    setIsSelecting(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !overlayRef.current) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    setEndX(e.clientX - rect.left);
    setEndY(e.clientY - rect.top);
  };
  
  const handleMouseUp = () => {
    setIsSelecting(false);
  };
  
  const captureScreenshot = () => {
    if (!canvasRef.current || width < 10 || height < 10) return;
    
    try {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const overlayRect = overlayRef.current?.getBoundingClientRect();
      
      if (!overlayRect) return;
      
      const scaleX = canvasRef.current.width / canvasRect.width;
      const scaleY = canvasRef.current.height / canvasRect.height;
      
      const offsetX = canvasRect.left - overlayRect.left;
      const offsetY = canvasRect.top - overlayRect.top;
      
      const canvasLeft = Math.max(0, (left - offsetX) * scaleX);
      const canvasTop = Math.max(0, (top - offsetY) * scaleY);
      const canvasWidth = Math.min(width * scaleX, canvasRef.current.width - canvasLeft);
      const canvasHeight = Math.min(height * scaleY, canvasRef.current.height - canvasTop);
      
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      
      tempCtx.drawImage(
        canvasRef.current,
        canvasLeft, canvasTop, canvasWidth, canvasHeight,
        0, 0, canvasWidth, canvasHeight
      );
      
      const screenshot = tempCanvas.toDataURL('image/png', 1.0);
      onCapture(screenshot);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        cursor: isSelecting ? 'crosshair' : 'crosshair',
        userSelect: 'none',
      }}
    >
      <Box
        ref={overlayRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha('#000', 0.5),
          backdropFilter: 'blur(2px)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {(width > 5 && height > 5) && (
        <Box
          sx={{
            position: 'absolute',
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: 'transparent',
            boxShadow: `0 0 0 9999px ${alpha('#000', 0.5)}`,
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Instructions */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.85),
          borderRadius: 2,
          boxShadow: 3,
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          zIndex: 10001,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Select Area to Search
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
          Click and drag to select an area of your design to search for similar images
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={captureScreenshot}
            disabled={width < 10 || height < 10}
            startIcon={<PhotoCameraIcon />}
          >
            Capture Selection
          </Button>
          <Button 
            variant="outlined" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Box>
      
      {/* Close button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          },
          zIndex: 10001,
        }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default ScreenshotSelector;
