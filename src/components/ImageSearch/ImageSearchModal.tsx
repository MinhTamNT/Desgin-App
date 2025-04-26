import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, ImageList, ImageListItem, Modal, CircularProgress, IconButton, TextField, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { alpha, useTheme } from '@mui/material/styles';

interface ImageSearchModalProps {
  open: boolean;
  onClose: () => void;
  searchImage?: string; // base64 of captured image
  onSelectImage: (imageUrl: string) => void;
}

interface SearchResult {
  id: string;
  url: string;
  title?: string;
  thumbnail: string;
  source?: string;
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  open,
  onClose,
  searchImage,
  onSelectImage
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Perform the search when searchImage changes
  useEffect(() => {
    if (searchImage && open) {
      searchSimilarImages(searchImage);
    }
  }, [searchImage, open]);

  const searchSimilarImages = async (imageBase64: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Here you would call your actual image search API with the imageBase64 data
      // For example using Google Cloud Vision API, Microsoft Azure Computer Vision, etc.
      console.log('Searching with image data of length:', imageBase64.length);
      
      // Mock API call for demonstration - remove in production
      setTimeout(() => {
        const mockResults: SearchResult[] = [
          {
            id: '1',
            url: 'https://source.unsplash.com/random/800x600?design',
            thumbnail: 'https://source.unsplash.com/random/800x600?design',
            title: 'Design Concept',
            source: 'Unsplash'
          },
          {
            id: '2',
            url: 'https://source.unsplash.com/random/800x600?ui',
            thumbnail: 'https://source.unsplash.com/random/800x600?ui',
            title: 'UI Layout',
            source: 'Unsplash'
          },
          {
            id: '3',
            url: 'https://source.unsplash.com/random/800x600?web',
            thumbnail: 'https://source.unsplash.com/random/800x600?web',
            title: 'Web Design',
            source: 'Unsplash'
          },
          {
            id: '4',
            url: 'https://source.unsplash.com/random/800x600?interface',
            thumbnail: 'https://source.unsplash.com/random/800x600?interface',
            title: 'User Interface',
            source: 'Unsplash'
          },
          {
            id: '5',
            url: 'https://source.unsplash.com/random/800x600?app',
            thumbnail: 'https://source.unsplash.com/random/800x600?app',
            title: 'App Design',
            source: 'Unsplash'
          },
          {
            id: '6',
            url: 'https://source.unsplash.com/random/800x600?graphic',
            thumbnail: 'https://source.unsplash.com/random/800x600?graphic',
            title: 'Graphic Design',
            source: 'Unsplash'
          }
        ];
        
        setResults(mockResults);
        setLoading(false);
      }, 1500);
      
      /* 
      // Actual API implementation would look something like this:
      const response = await fetch('https://your-image-search-api.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to search for similar images');
      }
      
      const data = await response.json();
      setResults(data.results);
      setLoading(false);
      */
    } catch (err) {
      console.error('Error searching for similar images:', err);
      setError('Failed to search for similar images. Please try again.');
      setLoading(false);
    }
  };

  const handleTextSearch = () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // Mock text search - replace with actual API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '7',
          url: `https://source.unsplash.com/random/800x600?${searchQuery}`,
          thumbnail: `https://source.unsplash.com/random/800x600?${searchQuery}`,
          title: `${searchQuery} design`,
          source: 'Unsplash'
        },
        {
          id: '8',
          url: `https://source.unsplash.com/random/800x600?${searchQuery},ui`,
          thumbnail: `https://source.unsplash.com/random/800x600?${searchQuery},ui`,
          title: `${searchQuery} UI`,
          source: 'Unsplash'
        },
        {
          id: '9',
          url: `https://source.unsplash.com/random/800x600?${searchQuery},web`,
          thumbnail: `https://source.unsplash.com/random/800x600?${searchQuery},web`,
          title: `${searchQuery} Web`,
          source: 'Unsplash'
        }
      ];
      
      setResults(mockResults);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSearch();
    }
  };

  const handleAddImageToCanvas = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="image-search-modal"
      aria-describedby="modal-to-display-similar-images"
    >
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: 700 },
          maxHeight: '85vh',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.paper,
          outline: 'none',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" fontWeight="600">
            Similar Images
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleTextSearch} size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                '&.MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                }
              }
            }}
          />
        </Box>
        
        {searchImage && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', borderRadius: 1, overflow: 'hidden' }}>
            <Box
              component="img"
              src={searchImage}
              alt="Screenshot"
              sx={{
                maxHeight: 150,
                maxWidth: '100%',
                objectFit: 'contain',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 1,
              }}
            />
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}
        
        {error && (
          <Box sx={{ my: 2, p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {!loading && results.length > 0 && (
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            <ImageList cols={3} gap={12}>
              {results.map((item) => (
                <ImageListItem 
                  key={item.id}
                  sx={{ 
                    cursor: 'pointer',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      '& .MuiBox-root': {
                        opacity: 1,
                      }
                    }
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title || 'Image result'}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: alpha(theme.palette.common.black, 0.5),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    }}
                  >
                    <IconButton 
                      onClick={() => handleAddImageToCanvas(item.url)}
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                        }
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  {item.title && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        backgroundColor: alpha(theme.palette.common.black, 0.6),
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                        {item.title}
                      </Typography>
                    </Box>
                  )}
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}
        
        {/* No Results */}
        {!loading && results.length === 0 && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <Typography color="text.secondary">No images found. Try a different search or capture another screenshot.</Typography>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

export default ImageSearchModal;
