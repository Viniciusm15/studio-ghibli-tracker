'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ThemeProvider, createTheme, useTheme, alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Modal from '@mui/material/Modal';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';

const FILMS_API = 'https://ghibliapi.vercel.app/films';
const STORAGE_KEY = 'ghibli_films_data';

function GhibliFilms({ toggleColorMode }) {
  const theme = useTheme();
  const [films, setFilms] = useState([]);
  const [watched, setWatched] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return {
        watchedFilms: savedData.watchedFilms || [],
        ratings: savedData.ratings || {}
      };
    }
    return { watchedFilms: [], ratings: {} };
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [expandedFilm, setExpandedFilm] = useState(null);

  useEffect(() => {
    fetch(FILMS_API)
      .then(res => res.json())
      .then(data => setFilms(data))
      .catch(error => console.error('Error fetching films:', error));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    }
  }, [watched]);

  const toggleWatched = (id) => {
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
  };

  const updateRating = (id, rating) => {
    setWatched(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [id]: rating
      }
    }));
  };

  const filteredFilms = useMemo(() => {
    let result = films.filter((film) => {
      const matchesSearch = film.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter === 'watched') return watched.watchedFilms.includes(film.id) && matchesSearch;
      if (filter === 'unwatched') return !watched.watchedFilms.includes(film.id) && matchesSearch;
      return matchesSearch;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'release_date':
          return new Date(a.release_date) - new Date(b.release_date);
        case 'rating':
          const ratingA = watched.ratings[a.id] || 0;
          const ratingB = watched.ratings[b.id] || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });

    return result;
  }, [films, filter, watched, searchTerm, sortBy]);

  const watchedCount = watched.watchedFilms.length;
  const totalFilms = films.length;

  return (
    <Container maxWidth={false} sx={{
      py: 4,
      px: { xs: 2, sm: 3, md: 4 },
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(to bottom, #121212, #1e1e1e)'
        : 'linear-gradient(to bottom, #f5f7fa, #e4e8f0)',
      minHeight: '100vh'
    }}>
      <Modal
        open={Boolean(expandedFilm)}
        onClose={() => setExpandedFilm(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box sx={{
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          p: 4,
          position: 'relative',
          border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30,30,30,0.95), rgba(18,18,18,0.98))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,245,0.98))',
          '&:focus': {
            outline: 'none'
          }
        }}>
          {expandedFilm && (
            <>
              <IconButton
                onClick={() => setExpandedFilm(null)}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <CloseIcon />
              </IconButton>

              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: 'text.primary',
                  background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                {expandedFilm.title}
              </Typography>

              <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 4,
                flexWrap: 'wrap'
              }}>
                <Chip
                  label={`Diretor: ${expandedFilm.director}`}
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={`Ano: ${expandedFilm.release_date}`}
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={`Score: ${expandedFilm.rt_score}`}
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                />
                {watched.watchedFilms.includes(expandedFilm.id) && (
                  <Chip
                    label={`Sua avaliação: ${watched.ratings[expandedFilm.id] || 'Não avaliado'}`}
                    variant="outlined"
                    sx={{
                      borderColor: alpha(theme.palette.secondary.main, 0.3),
                      color: 'text.primary',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  textAlign: 'justify',
                  mb: 3
                }}
              >
                {expandedFilm.description}
              </Typography>

              <Box sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                p: 3,
                mb: 3
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'text.primary'
                  }}
                >
                  Detalhes do Filme
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5
                  }}>
                    <PersonOutlineIcon
                      sx={{
                        color: 'text.secondary',
                        fontSize: 22,
                        mt: '2px'
                      }}
                    />
                    <Typography variant="body1" sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}>
                      <Box component="span" sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mr: 0.5
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
                    <AccessTimeIcon
                      sx={{
                        color: theme.palette.mode === 'dark'
                          ? theme.palette.secondary.light
                          : theme.palette.primary.dark,
                        fontSize: 22,
                        mt: '2px'
                      }}
                    />
                    <Typography variant="body1" sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}>
                      <Box component="span" sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mr: 0.5
                      }}>
                        Duração:
                      </Box>
                      <Box component="span" sx={{ fontWeight: 500 }}>
                        {expandedFilm.running_time} minutos
                      </Box>
                    </Typography>
                  </Box>

                  {watched.watchedFilms.includes(expandedFilm.id) && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mt: 2
                    }}>
                      <Typography variant="body1" sx={{
                        fontWeight: 600,
                        color: 'text.primary'
                      }}>
                        Sua avaliação:
                      </Typography>
                      <Rating
                        name={`rating-${expandedFilm.id}`}
                        value={watched.ratings[expandedFilm.id] || null}
                        onChange={(event, newValue) => {
                          updateRating(expandedFilm.id, newValue);
                        }}
                        precision={0.5}
                        size="large"
                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Box sx={{
        mb: 4,
        maxWidth: 'lg',
        mx: 'auto'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          backdropFilter: 'blur(8px)',
          background: alpha(theme.palette.background.paper, 0.8),
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          mb: 3
        }}>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-0.5px'
              }}
            >
              🎥 Filmes do Studio Ghibli
            </Typography>

            <Typography variant="subtitle1" sx={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 2,
              gap: 1
            }}>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {watchedCount}
              </Box>
              de
              <Box component="span" sx={{ fontWeight: 600 }}>
                {totalFilms}
              </Box>
              filmes assistidos
            </Typography>
          </Box>

          <IconButton onClick={toggleColorMode} color="inherit" sx={{
            alignSelf: { xs: 'center', sm: 'flex-end' },
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            p: 1.5,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              transform: 'rotate(180deg)',
              transition: 'all 0.5s ease'
            },
            transition: 'all 0.3s ease'
          }}>
            {theme.palette.mode === 'dark' ?
              <Brightness7Icon sx={{ fontSize: 28 }} /> :
              <Brightness4Icon sx={{ fontSize: 28 }} />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Pesquisar filmes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8)
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  color: 'text.primary',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    borderWidth: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'text.primary',
                  }
                }}
                displayEmpty
                inputProps={{ 'aria-label': 'Filtrar filmes' }}
              >
                <MenuItem value="all">Todos ({totalFilms})</MenuItem>
                <MenuItem value="watched">Assistidos ({watchedCount})</MenuItem>
                <MenuItem value="unwatched">Não assistidos ({totalFilms - watchedCount})</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  color: 'text.primary',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    borderWidth: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'text.primary',
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
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)'
            }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
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
              <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '550px',
                borderRadius: 4,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 28px 0 ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}>
                <CardMedia
                  component="img"
                  image={film.image}
                  alt={film.title}
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <CardContent sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.9)
                    : alpha(theme.palette.background.paper, 0.95),
                  borderBottom: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(0, 0, 0, 0.12)'
                }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 2,
                      lineHeight: 1.3
                    }}
                  >
                    {film.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box component="span" sx={{
                      color: 'primary.main',
                      fontWeight: 500
                    }}>
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
                        onChange={(event, newValue) => {
                          updateRating(film.id, newValue);
                        }}
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
                <CardActions sx={{
                  px: 2,
                  pb: 2,
                  pt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
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
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default function ToggleColorMode() {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
              primary: { main: '#1976D2' },
              secondary: { main: '#9C27B0' },
            }
            : {
              primary: { main: '#90CAF9' },
              secondary: { main: '#CE93D8' },
            }),
        },
        typography: {
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GhibliFilms toggleColorMode={colorMode.toggleColorMode} />
    </ThemeProvider>
  );
}