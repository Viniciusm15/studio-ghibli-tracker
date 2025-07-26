'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  useTheme,
  alpha,
  styled
} from '@mui/material/styles';
import {
  Container,
  Typography,
  Box,
  CssBaseline,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Modal,
  Rating
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  PersonOutline as PersonOutlineIcon,
  Star as StarIcon,
  Info as InfoIcon,
  PersonPin as PersonPinIcon,
  CalendarToday as CalendarTodayIcon,
  StarBorder as StarBorderIcon,
  RateReview as RateReviewIcon
} from '@mui/icons-material';

const BACKGROUND_IMAGES = {
  light: 'https://i.imgur.com/Cuulf0p.png',
  dark: 'https://i.imgur.com/ItCm2bO.png'
};

const FILMS_API = 'https://ghibliapi.vercel.app/films';
const STORAGE_KEY = 'ghibli_films_data';

const GradientText = styled(Typography)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #CE93D8, #90CAF9)'
    : 'linear-gradient(45deg, #9C27B0, #1976D2)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  letterSpacing: '-0.5px',
  textShadow: theme.palette.mode === 'dark'
    ? '0 2px 4px rgba(0,0,0,0.3)'
    : '0 2px 4px rgba(0,0,0,0.1)'
}));

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: '550px',
  borderRadius: 16,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backgroundColor: alpha(theme.palette.background.paper, 0.92),
  backdropFilter: 'blur(12px)',
  boxShadow: theme.shadows[10],
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 28px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
    borderColor: theme.palette.primary.main
  }
}));

const DetailModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backdropFilter: 'blur(8px)',
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  overflow: 'auto',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  maxWidth: '90vw',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  backgroundColor: alpha(theme.palette.background.paper, 0.98),
  borderRadius: 16,
  boxShadow: theme.shadows[15],
  padding: theme.spacing(4),
  position: 'relative',
  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  margin: '20px 0',
  '&:focus': { outline: 'none' },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '95vw',
    padding: theme.spacing(2),
    '& .MuiTypography-h3': {
      fontSize: '1.5rem',
      pr: 0
    },
    '& .MuiRating-root': {
      transform: 'scale(0.8)',
      transformOrigin: 'left center'
    }
  }
}));

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

function GhibliFilms({ toggleColorMode }) {
  const theme = useTheme();
  const [films, setFilms] = useState([]);
  const [watched, setWatched] = useLocalStorage(STORAGE_KEY, {
    watchedFilms: [],
    ratings: {}
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [expandedFilm, setExpandedFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const imgLight = new Image();
    imgLight.src = BACKGROUND_IMAGES.light;
    const imgDark = new Image();
    imgDark.src = BACKGROUND_IMAGES.dark;
  }, []);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(FILMS_API);
        if (!response.ok) throw new Error('Failed to fetch films');
        const data = await response.json();
        setFilms(data);
      } catch (err) {
        console.error('Error fetching films:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const toggleWatched = useCallback((id) => {
    setWatched(prev => {
      const isWatched = prev.watchedFilms.includes(id);
      const newWatchedFilms = isWatched
        ? prev.watchedFilms.filter(filmId => filmId !== id)
        : [...prev.watchedFilms, id];

      const newRatings = { ...prev.ratings };
      if (isWatched) {
        delete newRatings[id];
      }

      return {
        watchedFilms: newWatchedFilms,
        ratings: newRatings
      };
    });
  }, [setWatched]);

  const updateRating = useCallback((id, rating) => {
    setWatched(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [id]: rating
      }
    }));
  }, [setWatched]);

  const filteredFilms = useMemo(() => {
    if (!films) return [];

    let result = films.filter((film) => {
      const matchesSearch = film.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'watched') return watched.watchedFilms.includes(film.id) && matchesSearch;
      if (filter === 'unwatched') return !watched.watchedFilms.includes(film.id) && matchesSearch;
      return matchesSearch;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'release_date': return new Date(a.release_date) - new Date(b.release_date);
        case 'rating':
          const ratingA = watched.ratings[a.id] || 0;
          const ratingB = watched.ratings[b.id] || 0;
          return ratingB - ratingA;
        default: return 0;
      }
    });

    return result;
  }, [films, filter, watched, searchTerm, sortBy]);

  const watchedCount = watched.watchedFilms.length;
  const totalFilms = films.length;

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: `url(${BACKGROUND_IMAGES[theme.palette.mode]}) center/cover fixed`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.default, 0.9),
          backdropFilter: 'blur(4px)'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" color="text.secondary">
            Carregando filmes Ghibli...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: `url(${BACKGROUND_IMAGES[theme.palette.mode]}) center/cover fixed`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.default, 0.9),
          backdropFilter: 'blur(4px)'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" color="error">
            Erro ao carregar filmes: {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{
      py: 4,
      px: { xs: 2, sm: 3, md: 4 },
      minHeight: '100vh',
      background: `url(${BACKGROUND_IMAGES[theme.palette.mode]}) center/cover fixed`,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(18, 18, 18, 0.85)'
          : 'rgba(245, 247, 250, 0.85)',
        backdropFilter: 'blur(4px)'
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <DetailModal
          open={Boolean(expandedFilm)}
          onClose={() => setExpandedFilm(null)}
        >
          <ModalContent
            sx={{
              position: 'relative',
              p: { xs: 3, md: 4 },
              maxWidth: '800px',
              width: 'calc(100% - 32px)',
              margin: 'auto',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: '12px',
              overflow: 'hidden',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {expandedFilm && (
              <Box sx={{
                minWidth: 'min-content',
                width: '100%',
                overflow: 'visible'
              }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedFilm(null);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    zIndex: 2,
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <GradientText
                    variant="h3"
                    gutterBottom
                    sx={{
                      mb: 4,
                      pr: 4,
                      fontSize: { xs: '1.8rem', sm: '2.2rem' },
                      textShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
                      position: 'relative',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: '60px',
                        height: '3px',
                        borderRadius: '3px'
                      }
                    }}
                  >
                    {expandedFilm.title}
                  </GradientText>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 4,
                      flexWrap: 'wrap',
                      '& .MuiChip-root': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        color: 'text.primary',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      }
                    }}
                  >
                    <Chip
                      label={`Diretor: ${expandedFilm.director}`}
                      variant="outlined"
                      icon={<PersonPinIcon fontSize="small" />}
                    />
                    <Chip
                      label={`Ano: ${expandedFilm.release_date}`}
                      variant="outlined"
                      icon={<CalendarTodayIcon fontSize="small" />}
                    />
                    <Chip
                      label={`Score: ${expandedFilm.rt_score}`}
                      variant="outlined"
                      icon={<StarBorderIcon fontSize="small" />}
                    />
                    {watched.watchedFilms.includes(expandedFilm.id) && (
                      <Chip
                        label={`Sua avaliação: ${watched.ratings[expandedFilm.id] || 'Não avaliado'}`}
                        variant="outlined"
                        sx={{
                          borderColor: alpha(theme.palette.secondary.main, 0.3),
                          backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                          }
                        }}
                        icon={<RateReviewIcon fontSize="small" />}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.8,
                      fontSize: '1.05rem',
                      textAlign: 'justify',
                      mb: 4,
                    }}
                  >
                    {expandedFilm.description}
                  </Typography>

                  <Box
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      borderRadius: '12px',
                      p: 3,
                      mb: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                        borderColor: alpha(theme.palette.primary.main, 0.2)
                      }
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 3,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '& svg': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      <InfoIcon fontSize="medium" />
                      Detalhes do Filme
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        '& > div': {
                          transition: 'all 0.2s ease',
                          p: 1.5,
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                            transform: 'translateX(4px)'
                          }
                        }
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        '& .MuiSvgIcon-root': {
                          color: theme.palette.primary.main,
                          fontSize: 22,
                          mt: '2px',
                          flexShrink: 0,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          p: '4px',
                          borderRadius: '6px'
                        }
                      }}>
                        <PersonOutlineIcon />
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          <Box component="span" sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mr: 0.5,
                            display: 'inline-block',
                            minWidth: '70px'
                          }}>
                            Produtor:
                          </Box>
                          {expandedFilm.producer}
                        </Typography>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5
                      }}>
                        <AccessTimeIcon />
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          <Box component="span" sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mr: 0.5,
                            display: 'inline-block',
                            minWidth: '70px'
                          }}>
                            Duração:
                          </Box>
                          {expandedFilm.running_time} minutos
                        </Typography>
                      </Box>

                      {watched.watchedFilms.includes(expandedFilm.id) && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mt: 2,
                          pt: 2,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          flexWrap: 'wrap',
                          minWidth: 'min-content'
                        }}>
                          <Typography variant="body1" sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            minWidth: '110px'
                          }}>
                            Sua avaliação:
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 'min-content'
                          }}>
                            <Rating
                              name={`modal-rating-${expandedFilm.id}`}
                              value={watched.ratings[expandedFilm.id] || 0}
                              onChange={(event, newValue) => updateRating(expandedFilm.id, newValue)}
                              precision={0.5}
                              size="large"
                              sx={{
                                '& .MuiRating-iconEmpty': {
                                  color: theme.palette.mode === 'dark' ? '#4A4A4A' : '#E0E0E0'
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </ModalContent>
        </DetailModal>

        <Box sx={{ mb: 4, maxWidth: 'lg', mx: 'auto' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            p: 3,
            borderRadius: 3,
            backdropFilter: 'blur(8px)',
            background: alpha(theme.palette.background.paper, 0.9),
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            mb: 3
          }}>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
              <GradientText variant="h2" sx={{ mb: 1.5 }}>
                Filmes do Studio Ghibli
              </GradientText>
              <Typography variant="subtitle1" sx={{
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {watchedCount}
                </Box>
                de
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {totalFilms}
                </Box>
                filmes assistidos
              </Typography>
            </Box>

            <IconButton onClick={toggleColorMode} color="inherit" sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                transform: 'rotate(180deg)'
              },
              transition: 'all 0.4s ease'
            }}>
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon sx={{ fontSize: 28 }} />
              ) : (
                <Brightness4Icon sx={{ fontSize: 28 }} />
              )}
            </IconButton>
          </Box>

          <Box sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' }
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Pesquisar filmes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 0.9)
                  }
                },
                '& .MuiOutlinedInput-input': {
                  py: 1.5,
                  px: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{
              display: 'flex',
              gap: 2,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <FormControl sx={{ minWidth: 140 }}>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.9)
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2
                    }
                  }}
                >
                  <MenuItem value="all">Todos ({totalFilms})</MenuItem>
                  <MenuItem value="watched">Assistidos ({watchedCount})</MenuItem>
                  <MenuItem value="unwatched">Não assistidos ({totalFilms - watchedCount})</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 160 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.9)
                    },
                    '& .MuiSelect-select': {
                      py: 1.5,
                      px: 2
                    }
                  }}
                >
                  <MenuItem value="title">Título (A-Z)</MenuItem>
                  <MenuItem value="release_date">Data de Lançamento</MenuItem>
                  <MenuItem value="rating">Avaliação</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3, lg: 4 }} sx={{
          justifyContent: 'center',
          alignItems: 'stretch',
          maxWidth: 'lg',
          margin: '0 auto',
          px: { xs: 2, sm: 0 }
        }}>
          {filteredFilms.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{
                textAlign: 'center',
                p: 4,
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.background.paper, 0.8),
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  Nenhum filme encontrado.
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredFilms.map((film) => (
              <Grid item key={film.id} xs={12} sm={6} md={4} sx={{
                display: 'flex',
                minHeight: '100%',
                maxWidth: { md: 'calc(100%/3 - 32px)' }
              }}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    image={film.image}
                    alt={film.title}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}
                  />
                  <CardContent sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                  }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2, lineHeight: 1.3 }}>
                      {film.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        🎬 {film.director}
                      </Box>
                      <Box component="span">—</Box>
                      <Box component="span">
                        📅 {film.release_date}
                      </Box>
                    </Typography>
                    {watched.watchedFilms.includes(film.id) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating
                          name={`simple-rating-${film.id}`}
                          value={watched.ratings[film.id] || null}
                          onChange={(event, newValue) => updateRating(film.id, newValue)}
                          precision={0.5}
                          size="small"
                          readOnly={false}
                          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {watched.ratings[film.id] ? `(${watched.ratings[film.id]}/5)` : '(Avalie)'}
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'justify',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.6,
                        mb: 1
                      }}
                    >
                      {film.description}
                    </Typography>
                    <Button
                      onClick={() => setExpandedFilm(film)}
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        mt: 'auto',
                        textTransform: 'none',
                      }}
                    >
                      Ver detalhes completos
                    </Button>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => toggleWatched(film.id)}
                      sx={{
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        background: watched.watchedFilms.includes(film.id)
                          ? 'linear-gradient(45deg, #4CAF50, #2E7D32)'
                          : 'linear-gradient(45deg, #2196F3, #1976D2)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        '&:hover': {
                          boxShadow: '0 6px 10px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {watched.watchedFilms.includes(film.id) ? '✅ Assistido' : '➕ Marcar como assistido'}
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Container>
  );
}

export default function ToggleColorMode() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        primary: { main: '#1976D2' },
        secondary: { main: '#9C27B0' },
        background: {
          default: '#f5f7fa',
          paper: '#ffffff'
        }
      } : {
        primary: { main: '#90CAF9' },
        secondary: { main: '#CE93D8' },
        background: {
          default: '#121212',
          paper: '#1e1e1e'
        }
      }),
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            '&::after': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: mode === 'dark'
                ? `radial-gradient(circle at 20% 30%, ${alpha('#CE93D8', 0.1)} 0%, transparent 25%)`
                : `radial-gradient(circle at 20% 30%, ${alpha('#9C27B0', 0.05)} 0%, transparent 25%)`,
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'float 15s infinite ease-in-out'
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translate(0, 0)' },
              '50%': { transform: 'translate(0, 20px)' }
            }
          }
        }
      }
    }
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GhibliFilms toggleColorMode={colorMode.toggleColorMode} />
    </ThemeProvider>
  );
}