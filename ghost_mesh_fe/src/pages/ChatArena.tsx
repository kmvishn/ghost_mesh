import React, { useState, useEffect, useRef } from 'react';
import { 
  listCharacters, 
  createChatSession, 
  listChatSessions,
  fetchSessionMessages,
  getAuthToken, 
  WS_BASE_URL,
  type AICharacter,
  type ChatSession
} from '../apis/api';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Checkbox, 
  FormGroup, 
  TextField, 
  CircularProgress, 
  Avatar, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Divider, 
  Grid, 
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import TimerIcon from '@mui/icons-material/Timer';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ChatIcon from '@mui/icons-material/Chat';

interface Message {
  name?: string;
  message?: string;
  user?: string; // handles default {"user": "Begin"}
}

const CHAT_SESSION_TTL = 3600; // 60 minutes

const ChatArena: React.FC = () => {
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Session state
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHAT_SESSION_TTL);
  const [isDissolving, setIsDissolving] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const list = await listCharacters();
        setCharacters(list);

        // Load saved sessions directly from DB
        const dbSessions = await listChatSessions();
        setRecentSessions(dbSessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Grid synch failed');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (activeSession) {
      setTimeLeft(CHAT_SESSION_TTL);
      if (timerRef.current) window.clearInterval(timerRef.current);
      
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCloseSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [activeSession]);

  // Scroll to bottom when messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Connect to WebSockets
  const connectWebSocket = (sessionId: string) => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const token = getAuthToken();
    if (!token) {
      setError('Auth credentials missing for WebSocket link');
      return;
    }

    // Connect to WebSocket using token query parameter
    const wsUrl = `${WS_BASE_URL}/ws/chat/${sessionId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('Ghost Session socket link established');
      setIsTyping(false);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('WS message payload:', payload);

        // Filter out "Begin" markers or empty payloads
        if (payload.user === 'Begin' || (payload.name === 'Begin')) {
          return;
        }

        if (payload.error) {
          setError(`Grid resonance error: ${payload.error}`);
          return;
        }

        // Add message
        setMessages(prev => {
          // Prevent duplicates if websocket bounces it back
          const isDuplicate = prev.some(m => m.message === payload.message && m.name === payload.name);
          if (isDuplicate) return prev;
          return [...prev, payload];
        });

        // Reset timer countdown on activity
        setTimeLeft(CHAT_SESSION_TTL);

        // If message is from an AI agent, turn off typing indicator
        if (payload.name && payload.name !== 'User') {
          setIsTyping(false);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket transmission', err);
      }
    };

    ws.onclose = () => {
      console.log('Ghost Session socket disconnected');
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
    };
  };

  const handleStartSession = async () => {
    if (selectedCharIds.length === 0) {
      setError('Select at least one digital entity to initiate contact');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const session = await createChatSession(selectedCharIds, sessionTitle || undefined);
      
      // Update session registry directly from DB
      const dbSessions = await listChatSessions();
      setRecentSessions(dbSessions);
      setSessionTitle('');

      // Set active session
      setMessages([]);
      setActiveSession(session);
      connectWebSocket(session.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to instantiate chat arena session');
    } finally {
      setLoading(false);
    }
  };

  const handleReconnectSession = async (session: ChatSession) => {
    setError('');
    setLoading(true);
    try {
      const history = await fetchSessionMessages(session.session_id);
      const formattedHistory = history
        .filter(m => m.sender_type !== 'system')
        .map(m => ({
          name: m.sender_name,
          message: m.message
        }));

      setMessages(formattedHistory);
      setActiveSession(session);
      connectWebSocket(session.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical session data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      name: 'User',
      message: inputText
    };

    try {
      socketRef.current.send(JSON.stringify(payload));
      setMessages(prev => [...prev, payload]);
      setInputText('');
      setIsTyping(true); // turn on typing indicator for AI agents
      setTimeLeft(CHAT_SESSION_TTL);
    } catch (err) {
      setError('Transmission burst failed to sync.');
    }
  };

  const handleCloseSession = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setActiveSession(null);
    setMessages([]);
  };

  const handlePurgeSession = () => {
    setIsDissolving(true);
    // dissolve animation lasts 2.5s
    setTimeout(() => {
      handleCloseSession();
      setIsDissolving(false);
    }, 2400);
  };

  const handleSelectCharacter = (id: string) => {
    setSelectedCharIds(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  // Helper to format remaining time (e.g. 59:32)
  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate blur/fade filter based on TTL (Ghost effect: fades as time runs out)
  const getFadingStyle = () => {
    if (!activeSession) return {};
    
    // Ghost fade triggers under 10 minutes (600 seconds)
    if (timeLeft < 600) {
      const percentage = timeLeft / 600; // 1 down to 0
      const blurVal = (1 - percentage) * 2; // up to 2px blur
      const opacityVal = 0.5 + percentage * 0.5; // down to 0.5 opacity
      return {
        filter: `blur(${blurVal}px)`,
        opacity: opacityVal,
        transition: 'filter 1s ease, opacity 1s ease'
      };
    }
    return {};
  };

  const getCharacterNamesForSession = (sessionCharIds: string[]) => {
    return sessionCharIds
      .map(id => {
        const match = characters.find(c => c.id === id);
        return match ? match.name : 'Unknown';
      })
      .filter(name => name !== 'Unknown');
  };

  if (loading && !activeSession) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#00f2fe' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, height: 'calc(100vh - 120px)', minHeight: 500 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, background: 'rgba(185, 43, 39, 0.1)', color: '#ff6b6b' }}>
          {error}
        </Alert>
      )}

      {!activeSession ? (
        // SESSION SELECTION / CREATION VIEW
        <Grid container spacing={4} sx={{ height: '100%' }}>
          {/* Left panel: Initiate contact */}
          <Grid size={{ xs: 12, md: 7 }} sx={{ height: '100%' }}>
            <Paper
              className="glass-panel"
              sx={{
                p: 4,
                background: 'rgba(16, 20, 35, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1, letterSpacing: '-0.5px' }}>
                INITIATE CONTACT
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
                Select one or multiple digital souls to bridge into an ephemeral session.
              </Typography>

              {characters.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 'auto', py: 4 }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.4)', mb: 2 }}>
                    Your roster is currently empty.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                    Go to the <b>AI Character Hub</b> to synthesize your first digital entity!
                  </Typography>
                </Box>
              ) : (
                <>
                  <TextField
                    label="Session Title (Optional)"
                    variant="outlined"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g. Operation Cyber-Resonance"
                    fullWidth
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(0, 242, 254, 0.3)' },
                        '&.Mui-focused fieldset': { borderColor: '#00f2fe' },
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 2
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        '&.Mui-focused': { color: '#00f2fe' }
                      }
                    }}
                  />
                  <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3, pr: 1 }}>
                    <FormGroup sx={{ gap: 2 }}>
                      {characters.map(char => (
                        <Paper
                          key={char.id}
                          onClick={() => handleSelectCharacter(char.id)}
                          sx={{
                            p: 2,
                            background: selectedCharIds.includes(char.id) ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${selectedCharIds.includes(char.id) ? 'rgba(0, 242, 254, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                            borderRadius: 3,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.04)',
                              borderColor: 'rgba(0, 242, 254, 0.2)'
                            }
                          }}
                        >
                          <Checkbox 
                            checked={selectedCharIds.includes(char.id)}
                            sx={{ color: 'rgba(255, 255, 255, 0.2)', '&.Mui-checked': { color: '#00f2fe' } }}
                          />
                          <Avatar 
                            src={char.avatar_url}
                            sx={{ background: 'linear-gradient(135deg, #00f2fe, #b92b27)', width: 44, height: 44 }}
                          >
                            {char.name.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                              {char.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>
                              {char.description}
                            </Typography>
                          </Box>
                        </Paper>
                      ))}
                    </FormGroup>
                  </Box>

                  <Button
                    variant="contained"
                    disabled={selectedCharIds.length === 0}
                    onClick={handleStartSession}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
                      color: '#070913',
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(0, 242, 254, 0.2)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #05d3de, #3e9ae6)',
                      }
                    }}
                  >
                    Bridge Connection
                  </Button>
                </>
              )}
            </Paper>
          </Grid>

          {/* Right panel: Recent / Active Sessions */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ height: '100%' }}>
            <Paper
              className="glass-panel"
              sx={{
                p: 4,
                background: 'rgba(16, 20, 35, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1, letterSpacing: '-0.5px' }}>
                EPHEMERAL CHAT REGISTRY
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
                Reconnect to active database-backed sessions.
              </Typography>

              {recentSessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', my: 'auto', py: 4 }}>
                  <ChatIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    Registry is empty. No recent channels established.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ overflowY: 'auto', flexGrow: 1, pr: 1 }}>
                  {recentSessions.map((session, index) => {
                    const charNames = getCharacterNamesForSession(session.character_ids);
                    return (
                      <React.Fragment key={session.session_id}>
                        <ListItem 
                          onClick={() => handleReconnectSession(session)}
                          sx={{
                            borderRadius: 3,
                            mb: 1,
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              background: 'rgba(0, 242, 254, 0.04)',
                              borderColor: 'rgba(0, 242, 254, 0.2)'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe' }}>
                              <RadioButtonCheckedIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                                {session.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                Opened: {new Date(session.created_at).toLocaleString()} | Entities: {charNames.join(', ')}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentSessions.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)' }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // ACTIVE SESSION VIEW
        <Box 
          className={isDissolving ? 'dissolving' : ''}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative'
          }}
        >
          {/* Active HUD Header */}
          <Paper
            className="glass-panel"
            sx={{
              p: 2.5,
              background: 'rgba(16, 20, 35, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box className="pulse-border" sx={{ width: 10, height: 10, borderRadius: '50%', background: '#00f2fe' }} />
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                  {activeSession.title.toUpperCase()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                  Resonating with: {getCharacterNamesForSession(activeSession.character_ids).join(', ')}
                </Typography>
              </Box>
            </Box>

            {/* Timer count down */}
            <Box display="flex" alignItems="center" gap={2}>
              <Chip 
                icon={<TimerIcon sx={{ color: timeLeft < 600 ? '#b92b27 !important' : '#00f2fe !important' }} />}
                label={formatTimeLeft(timeLeft)}
                sx={{
                  background: timeLeft < 600 ? 'rgba(185, 43, 39, 0.1)' : 'rgba(0, 242, 254, 0.08)',
                  color: timeLeft < 600 ? '#ff6b6b' : '#00f2fe',
                  border: `1px solid ${timeLeft < 600 ? 'rgba(185, 43, 39, 0.3)' : 'rgba(0, 242, 254, 0.2)'}`,
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              />
              <Tooltip title="Purge connection & dissolve conversations">
                <IconButton 
                  onClick={handlePurgeSession}
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.4)', 
                    '&:hover': { color: '#b92b27', background: 'rgba(185, 43, 39, 0.1)' } 
                  }}
                >
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Chat Arena Frame */}
          <Paper
            className="glass-panel chat-scroll"
            style={getFadingStyle()}
            sx={{
              p: 3,
              background: 'rgba(13, 16, 27, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              flexGrow: 1,
              mb: 3,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 'auto', py: 4 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontStyle: 'italic' }}>
                  Sub-space tunnel synced. Send a beacon to begin resonance...
                </Typography>
              </Box>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.name === 'User';
                return (
                  <Box 
                    key={idx}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={0.5} sx={{ px: 1 }}>
                      {!isUser && (
                        <Typography variant="caption" sx={{ color: '#b92b27', fontWeight: 700, letterSpacing: 0.5 }}>
                          {msg.name}
                        </Typography>
                      )}
                    </Box>

                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '75%',
                        borderRadius: isUser ? '16px 16px 0px 16px' : '16px 16px 16px 0px',
                        background: isUser ? 'rgba(0, 242, 254, 0.06)' : 'rgba(185, 43, 39, 0.06)',
                        border: `1px solid ${isUser ? 'rgba(0, 242, 254, 0.25)' : 'rgba(185, 43, 39, 0.25)'}`,
                        color: 'white',
                        boxShadow: isUser 
                          ? '0 0 10px rgba(0, 242, 254, 0.03)' 
                          : '0 0 10px rgba(185, 43, 39, 0.03)'
                      }}
                    >
                      <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                        {msg.message}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })
            )}

            {isTyping && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mb: 0.5, px: 1 }}>
                  Souls resonating
                </Typography>
                <Paper
                  sx={{
                    background: 'rgba(185, 43, 39, 0.02)',
                    border: '1px solid rgba(185, 43, 39, 0.1)',
                    borderRadius: '12px 12px 12px 0',
                  }}
                >
                  <Box className="typing-dots">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </Box>
                </Paper>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Paper>

          {/* Form input field */}
          <form onSubmit={handleSendMessage}>
            <Paper
              className="glass-panel"
              sx={{
                p: '8px 12px',
                background: 'rgba(16, 20, 35, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <TextField
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Broadcast frequency..."
                variant="standard"
                fullWidth
                disabled={isTyping}
                slotProps={{
                  input: {
                    disableUnderline: true,
                  }
                }}
                sx={{
                  color: 'white',
                  px: 1,
                  '& .MuiInputBase-input': {
                    color: 'white',
                    fontSize: '0.95rem'
                  }
                }}
              />
              <IconButton 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                sx={{
                  color: '#00f2fe',
                  '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.15)' },
                  background: 'rgba(0, 242, 254, 0.08)',
                  '&:hover': { background: 'rgba(0, 242, 254, 0.2)' }
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Paper>
          </form>
        </Box>
      )}
    </Box>
  );
};

export default ChatArena;
