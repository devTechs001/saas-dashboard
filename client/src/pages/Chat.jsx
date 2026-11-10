import React from 'react';
import {
  Box, Typography, Stack, Card, TextField, InputAdornment, IconButton, Badge,
  Divider, Chip, Button, Avatar, useTheme, Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFileOutlined';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import TagIcon from '@mui/icons-material/Tag';
import AddIcon from '@mui/icons-material/Add';
import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useSelector } from 'react-redux';
import { PageHeader, AppAvatar } from '../components/ui';
import { useSocket } from '../hooks/useSocket';
import { playMessageSound } from '../utils/sound';
import { DEMO_AVAILABLE } from '../config/env';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { chatChannels as mockChatChannels, chatMessages as mockChatMessages, teamMembers as mockTeamMembers } from '../data/sampleData';
const chatChannels = DEMO_AVAILABLE ? mockChatChannels : [];
const teamMembers = DEMO_AVAILABLE ? mockTeamMembers : [];
const chatMessages = DEMO_AVAILABLE ? mockChatMessages : {};
import { getAvatarColor } from '../utils/format';

const Chat = () => {
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);
  const { socket, isConnected } = useSocket();
  const [channel, setChannel] = React.useState('gen');
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState(chatMessages);
  const listRef = React.useRef(null);

  const activeChannel = chatChannels.find((c) => c.id === channel);
  const channelMessages = messages[channel] || [];

  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [channel, messages]);

  // Realtime: receive chat messages relayed by the server.
  React.useEffect(() => {
    if (!socket) return undefined;
    const onMessage = (msg) => {
      if (!msg || typeof msg.text !== 'string') return;
      const mine = msg.user === (user?.name || 'You');
      setMessages((prev) => ({
        ...prev,
        [msg.channel || 'gen']: [
          ...(prev[msg.channel || 'gen'] || []),
          {
            id: msg.id || `m_${Date.now()}`,
            user: msg.user || 'Teammate',
            text: msg.text,
            time: new Date(msg.time || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            mine,
          },
        ],
      }));
      if (!mine) playMessageSound();
    };
    socket.on('chat:message', onMessage);
    return () => socket.off('chat:message', onMessage);
  }, [socket, user]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');

    // Broadcast via the realtime server when connected; local echo otherwise.
    if (socket && isConnected) {
      socket.emit('chat:message', { channel, text, user: user?.name || 'You' });
      return;
    }
    const newMsg = {
      id: `m_${Date.now()}`,
      user: user?.name || 'You',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      mine: true,
    };
    setMessages((prev) => ({ ...prev, [channel]: [...(prev[channel] || []), newMsg] }));
    playMessageSound();
  };

  return (
    <Box>
      <PageHeader
        title="Team Chat"
        subtitle="Channels for every project, team, and random thought."
        actions={[
          <Button key="new" variant="outlined" startIcon={<AddIcon />} sx={{ borderRadius: 2.5 }}>New channel</Button>,
          <Button key="huddle" variant="contained" startIcon={<VideocamIcon />} sx={{ borderRadius: 2.5 }}>Start huddle</Button>,
        ]}
      />

      <Card sx={{ display: 'flex', height: 'calc(100vh - 260px)', minHeight: 520, overflow: 'hidden' }}>
        {/* Channel sidebar */}
        <Box sx={{
          width: 260, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column', bgcolor: 'background.paper',
        }}>
          <Box sx={{ p: 2 }}>
            <TextField
              size="small" fullWidth placeholder="Search channels…" variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'action.hover' } }}
            />
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', px: 1.25 }}>
            <Typography variant="overline" color="text.secondary" sx={{ px: 1.25, fontWeight: 800 }}>Channels</Typography>
            {chatChannels.map((c) => (
              <Stack
                key={c.id}
                direction="row"
                spacing={1.25}
                alignItems="center"
                onClick={() => setChannel(c.id)}
                sx={{
                  px: 1.5, py: 1, borderRadius: 2.5, cursor: 'pointer', mb: 0.5,
                  bgcolor: channel === c.id ? 'primary.main' : 'transparent',
                  color: channel === c.id ? '#fff' : 'text.primary',
                  fontWeight: channel === c.id ? 700 : 500,
                  '&:hover': { bgcolor: channel === c.id ? 'primary.main' : 'action.hover' },
                }}
              >
                <TagIcon sx={{ fontSize: 17, opacity: 0.8 }} />
                <Typography variant="body2" fontWeight="inherit" sx={{ flex: 1 }}>{c.name}</Typography>
                {c.unread > 0 && channel !== c.id && (
                  <Badge badgeContent={c.unread} color="error" sx={{ '& .MuiBadge-badge': { height: 18, minWidth: 18, fontSize: 10.5, fontWeight: 800 } }} />
                )}
              </Stack>
            ))}
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary" fontWeight={800}>Online — 4</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
              {teamMembers.filter((m) => m.status === 'online').slice(0, 4).map((m) => (
                <Tooltip key={m.id} title={`${m.name} — ${m.title}`}>
                  <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" color="success">
                    <AppAvatar name={m.name} size={32} />
                  </Badge>
                </Tooltip>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Channel header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TagIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={800}>{activeChannel?.name}</Typography>
              <Chip size="small" label={`${channelMessages.length} messages`} variant="outlined" />
              <Chip
                size="small"
                label={isConnected ? '● live' : '○ local'}
                color={isConnected ? 'success' : 'default'}
                variant="outlined"
                sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
              />
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Summarize with AI">
                <IconButton color="secondary"><AutoAwesomeIcon fontSize="small" /></IconButton>
              </Tooltip>
              <IconButton><VideocamIcon fontSize="small" /></IconButton>
            </Stack>
          </Stack>

          {/* Mobile channel chips (sidebar hidden on small screens) */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: 'flex', md: 'none' },
              px: 2, py: 1.25, overflowX: 'auto',
              borderBottom: '1px solid', borderColor: 'divider',
            }}
          >
            {chatChannels.map((c) => (
              <Chip
                key={c.id}
                label={`#${c.name}`}
                onClick={() => setChannel(c.id)}
                color={channel === c.id ? 'primary' : 'default'}
                variant={channel === c.id ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, flexShrink: 0 }}
              />
            ))}
          </Stack>

          {/* Message list */}
          <Box ref={listRef} sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 3 }, py: 2.5 }}>
            {channelMessages.map((m) => {
              const mine = m.mine || m.user === (user?.name || 'You');
              return (
                <Stack key={m.id} direction="row" spacing={1.5} sx={{ mb: 2.25, flexDirection: mine ? 'row-reverse' : 'row' }}>
                  <AppAvatar name={m.user} size={38} />
                  <Box sx={{ maxWidth: '72%' }}>
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ flexDirection: mine ? 'row-reverse' : 'row' }}>
                      <Typography variant="body2" fontWeight={700}>{mine ? 'You' : m.user}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.time}</Typography>
                    </Stack>
                    <Box sx={{
                      mt: 0.6, px: 1.75, py: 1.15, borderRadius: 2.75,
                      bgcolor: mine ? 'primary.main' : 'action.hover',
                      color: mine ? '#fff' : 'text.primary',
                      borderTopRightRadius: mine ? 6 : 2.75 * 4,
                      borderTopLeftRadius: mine ? 2.75 * 4 : 6,
                    }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.65 }}>{m.text}</Typography>
                    </Box>
                  </Box>
                </Stack>
              );
            })}
          </Box>

          {/* Composer */}
          <Divider />
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.75 }}>
            <IconButton size="small"><AttachFileIcon fontSize="small" /></IconButton>
            <TextField
              fullWidth
              size="small"
              placeholder={`Message #${activeChannel?.name || ''}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' } }}
            />
            <IconButton size="small"><EmojiEmotionsIcon fontSize="small" /></IconButton>
            <IconButton color="primary" onClick={handleSend} disabled={!draft.trim()}
              sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default Chat;
