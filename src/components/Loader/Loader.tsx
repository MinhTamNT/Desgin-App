import { Box, Typography, useTheme, keyframes, alpha } from '@mui/material';
import { useEffect, useState } from 'react';

// Keyframes for animations
const pulseAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeInAnimation = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pixelateAnimation = keyframes`
  0% { clip-path: inset(0 0 0 0); }
  20% { clip-path: inset(20% 0 0 20%); }
  40% { clip-path: inset(40% 20% 20% 0); }
  60% { clip-path: inset(0 40% 40% 20%); }
  80% { clip-path: inset(20% 20% 0 40%); }
  100% { clip-path: inset(0 0 0 0); }
`;

interface PixelProps {
  delay: number;
  color: string;
  size?: number;
  x: number;
  y: number;
  duration?: number;
}

const Pixel = ({ delay, color, size = 10, x, y, duration = 1.8 }: PixelProps) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '2px',
        left: `${x}%`,
        top: `${y}%`,
        boxShadow: `0 0 ${size/3}px rgba(0,0,0,0.1)`,
        animation: `${pulseAnimation} ${duration}s infinite ${delay}s`,
        zIndex: 2
      }}
    />
  );
};

export const Loader = () => {
  const theme = useTheme();
  const [loadingText, setLoadingText] = useState('Loading');
  const [pixelColors, setPixelColors] = useState<string[]>([]);
  
  // Generate pixel colors
  useEffect(() => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.primary.light,
      theme.palette.secondary.main,
      theme.palette.secondary.light,
      alpha(theme.palette.primary.main, 0.7),
      alpha(theme.palette.secondary.main, 0.7),
    ];
    
    setPixelColors(colors);
    
    // Cycle through loading text
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'Loading') return 'Loading.';
        if (prev === 'Loading.') return 'Loading..';
        if (prev === 'Loading..') return 'Loading...';
        return 'Loading';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [theme.palette.primary.main, theme.palette.secondary.main]);

  // Create pixel positions dynamically
  const pixelConfigs = [
    { x: 15, y: 20, delay: 0.1, color: pixelColors[0] || '#6366F1' },
    { x: 25, y: 30, delay: 0.2, color: pixelColors[1] || '#818CF8' },
    { x: 35, y: 20, delay: 0.3, color: pixelColors[2] || '#F472B6' },
    { x: 45, y: 30, delay: 0.4, color: pixelColors[3] || '#FB7185' },
    { x: 55, y: 20, delay: 0.5, color: pixelColors[4] || '#6366F1' },
    { x: 65, y: 30, delay: 0.6, color: pixelColors[5] || '#818CF8' },
    { x: 75, y: 20, delay: 0.7, color: pixelColors[0] || '#6366F1' },
    { x: 85, y: 30, delay: 0.8, color: pixelColors[1] || '#818CF8' },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.default, 0.97),
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 240,
          height: 240,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
        }}
      >
        {/* Pixelated background effect */}
        <Box
          sx={{
            position: 'absolute',
            width: '60%',
            height: '60%',
            backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.1)} 3px, transparent 3px)`,
            backgroundSize: '18px 18px',
            borderRadius: '50%',
            animation: `${rotateAnimation} 20s linear infinite`,
            opacity: 0.5,
          }}
        />
        
        {/* Orbiting circles */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            animation: `${rotateAnimation} 8s linear infinite`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              filter: 'blur(1px)',
            }}
          />
        </Box>
        
        <Box
          sx={{
            position: 'absolute',
            width: '90%',
            height: '90%',
            animation: `${rotateAnimation} 12s linear infinite reverse`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: '8%',
              right: '15%',
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: theme.palette.secondary.main,
            }}
          />
        </Box>
  
        {/* Main logo element */}
        <Box
          sx={{
            position: 'relative',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(8px)',
            borderRadius: 4,
            boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.3)}`,
            animation: `${pulseAnimation} 2s infinite ease-in-out`,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -4,
              borderRadius: 5,
              padding: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }
          }}
        >
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 800,
              fontSize: '2rem',
              letterSpacing: '1px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
              animation: `${pixelateAnimation} 3s infinite alternate`,
              fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
              zIndex: 1,
            }}
          >
            P
          </Typography>
          
          {/* Pixelated accents around the logo */}
          {pixelConfigs.map((config, index) => (
            <Pixel key={index} {...config} />
          ))}
        </Box>
        
        {/* Square pixels that float across the scene */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {[...Array(12)].map((_, i) => {
            const size = Math.floor(Math.random() * 10) + 4;
            const delay = Math.random() * 2;
            const duration = Math.random() * 6 + 10;
            const startX = Math.random() * 100;
            const startY = 120 - Math.random() * 40;
            const colorIndex = i % pixelColors.length;
            
            return (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  backgroundColor: pixelColors[colorIndex] || theme.palette.primary.main,
                  opacity: 0.6,
                  borderRadius: '1px',
                  transform: 'translateY(0px)',
                  animation: `${fadeInAnimation} ${duration}s infinite ${delay}s linear alternate`
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Loading text */}
      <Typography
        variant="body1"
        sx={{ 
          fontWeight: 500,
          color: alpha(theme.palette.text.primary, 0.7),
          letterSpacing: '1px',
          mt: 2,
          fontFamily: '"Roboto Mono", monospace',
        }}
      >
        {loadingText}
      </Typography>
    </Box>
  );
};
