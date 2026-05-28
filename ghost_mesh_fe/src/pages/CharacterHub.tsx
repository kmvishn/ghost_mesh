import React, { useState, useEffect } from 'react';
import { 
  listCharacters, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter, 
  type AICharacter 
} from '../apis/api';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress, 
  Chip, 
  IconButton,
  Alert,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BoltIcon from '@mui/icons-material/Bolt';

const CharacterHub: React.FC = () => {
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedChar, setSelectedChar] = useState<AICharacter | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personalityTraits, setPersonalityTraits] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchList = async () => {
    try {
      const list = await listCharacters();
      setCharacters(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve digital souls from grid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setPersonalityTraits('');
    setFormError('');
    setOpenCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !description.trim()) {
      setFormError('Name and Description are required to initialize a digital soul');
      return;
    }

    setFormLoading(true);
    try {
      const newChar = await createCharacter(name, description, personalityTraits);
      setCharacters(prev => [...prev, newChar]);
      setOpenCreate(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Creation protocol failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEdit = (char: AICharacter) => {
    setSelectedChar(char);
    setName(char.name);
    setDescription(char.description || '');
    setPersonalityTraits(char.personality_traits || '');
    setFormError('');
    setOpenEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChar) return;
    setFormError('');

    if (!name.trim() || !description.trim()) {
      setFormError('Name and Description are required');
      return;
    }

    setFormLoading(true);
    try {
      const updated = await updateCharacter(selectedChar.id, name, description, personalityTraits);
      setCharacters(prev => prev.map(c => c.id === selectedChar.id ? { ...c, ...updated } : c));
      setOpenEdit(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Update protocol failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (charId: string) => {
    if (!window.confirm('Are you sure you want to purge this digital soul from grid systems? This action is permanent.')) {
      return;
    }

    try {
      await deleteCharacter(charId);
      setCharacters(prev => prev.filter(c => c.id !== charId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purge protocol failed');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#00f2fe' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #00f2fe, #b92b27)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}
          >
            AI CHARACTER HUB
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Configure and maintain your persistent digital entities
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
            color: '#070913',
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(0, 242, 254, 0.2)',
            '&:hover': {
              background: 'linear-gradient(90deg, #05d3de, #3e9ae6)',
              boxShadow: '0 4px 20px rgba(0, 242, 254, 0.45)',
            }
          }}
        >
          Synthesize Soul
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, background: 'rgba(185, 43, 39, 0.1)', color: '#ff6b6b' }}>
          {error}
        </Alert>
      )}

      {characters.length === 0 ? (
        <Paper
          className="glass-panel"
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'rgba(16, 20, 35, 0.3)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: 4
          }}
        >
          <PsychologyIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.15)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
            No Persistent Entities Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
            Initialize your very first persistent AI character to chat in ephemeral spaces.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderColor: '#00f2fe',
              color: '#00f2fe',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#4facfe',
                background: 'rgba(0, 242, 254, 0.05)'
              }
            }}
          >
            Create Digital Character
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {characters.map((char) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={char.id}>
              <Card 
                className="glowing-card"
                sx={{
                  background: 'rgba(16, 20, 35, 0.45)',
                  boxShadow: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', pb: '16px !important' }}>
                  {/* Action buttons top-right */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(char)} sx={{ color: 'rgba(255, 255, 255, 0.4)', '&:hover': { color: '#00f2fe' } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(char.id)} sx={{ color: 'rgba(255, 255, 255, 0.4)', '&:hover': { color: '#b92b27' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar 
                      src={char.avatar_url} 
                      sx={{ 
                        width: 52, 
                        height: 52, 
                        background: 'linear-gradient(135deg, #00f2fe, #b92b27)', 
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        boxShadow: '0 0 10px rgba(0, 242, 254, 0.15)'
                      }}
                    >
                      {char.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box sx={{ maxWidth: 'calc(100% - 70px)' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {char.name}
                      </Typography>
                      <Chip 
                        size="small"
                        icon={<BoltIcon sx={{ color: '#00f2fe !important', fontSize: '14px' }} />}
                        label={char.avatar_url ? "Linked" : "Avatar Syncing"} 
                        sx={{ 
                          height: 20, 
                          background: char.avatar_url ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                          color: char.avatar_url ? '#00f2fe' : 'rgba(255, 255, 255, 0.5)',
                          border: `1px solid ${char.avatar_url ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                          fontSize: '10px',
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 1 }
                        }} 
                      />
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.65)', 
                      mb: 2, 
                      flexGrow: 1, 
                      display: '-webkit-box', 
                      overflow: 'hidden', 
                      WebkitBoxOrient: 'vertical', 
                      WebkitLineClamp: 3 
                    }}
                  >
                    {char.description || 'No system description set.'}
                  </Typography>

                  {char.personality_traits && (
                    <Box mt="auto">
                      <Typography variant="caption" sx={{ color: 'rgba(0, 242, 254, 0.8)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700, display: 'block', mb: 0.5, letterSpacing: 0.5 }}>
                        Personality Traits
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {char.personality_traits.split(',').map((t, idx) => (
                          <Chip 
                            key={idx}
                            label={t.trim()} 
                            size="small"
                            sx={{ 
                              background: 'rgba(255, 255, 255, 0.04)', 
                              color: 'rgba(255, 255, 255, 0.8)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              height: 20,
                              fontSize: '11px',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* CREATE DIALOG */}
      <Dialog 
        open={openCreate} 
        onClose={() => !formLoading && setOpenCreate(false)}
        PaperProps={{
          className: "glass-panel",
          sx: {
            background: 'rgba(13, 16, 27, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            width: '100%',
            maxWidth: 500,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'white', pb: 1 }}>Synthesize Digital Soul</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
            {formError && (
              <Alert severity="error" sx={{ background: 'rgba(185, 43, 39, 0.1)', color: '#ff6b6b' }}>
                {formError}
              </Alert>
            )}

            <TextField
              label="Entity Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={formLoading}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />

            <TextField
              label="Base Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={formLoading}
              multiline
              rows={3}
              fullWidth
              helperText="This description is also used to generate the avatar image."
              slotProps={{
                formHelperText: {
                  sx: { color: 'rgba(255, 255, 255, 0.4)' }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />

            <TextField
              label="Personality Traits"
              value={personalityTraits}
              onChange={(e) => setPersonalityTraits(e.target.value)}
              disabled={formLoading}
              placeholder="e.g. Sarcastic, Highly analytical, Cypherpunk enthusiast"
              fullWidth
              helperText="Separate multiple traits with commas."
              slotProps={{
                formHelperText: {
                  sx: { color: 'rgba(255, 255, 255, 0.4)' }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setOpenCreate(false)} disabled={formLoading} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formLoading}
              sx={{
                background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
                color: '#070913',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                borderRadius: 2
              }}
            >
              {formLoading ? <CircularProgress size={20} sx={{ color: '#070913' }} /> : 'Synthesize'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog 
        open={openEdit} 
        onClose={() => !formLoading && setOpenEdit(false)}
        PaperProps={{
          className: "glass-panel",
          sx: {
            background: 'rgba(13, 16, 27, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            width: '100%',
            maxWidth: 500,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'white', pb: 1 }}>Calibrate Digital Soul</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '10px !important' }}>
            {formError && (
              <Alert severity="error" sx={{ background: 'rgba(185, 43, 39, 0.1)', color: '#ff6b6b' }}>
                {formError}
              </Alert>
            )}

            <TextField
              label="Entity Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={formLoading}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />

            <TextField
              label="Base Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={formLoading}
              multiline
              rows={3}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />

            <TextField
              label="Personality Traits"
              value={personalityTraits}
              onChange={(e) => setPersonalityTraits(e.target.value)}
              disabled={formLoading}
              placeholder="e.g. Sarcastic, Highly analytical"
              fullWidth
              helperText="Separate multiple traits with commas."
              slotProps={{
                formHelperText: {
                  sx: { color: 'rgba(255, 255, 255, 0.4)' }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.02)',
                  color: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#00f2fe' },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setOpenEdit(false)} disabled={formLoading} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formLoading}
              sx={{
                background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
                color: '#070913',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                borderRadius: 2
              }}
            >
              {formLoading ? <CircularProgress size={20} sx={{ color: '#070913' }} /> : 'Calibrate'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CharacterHub;
