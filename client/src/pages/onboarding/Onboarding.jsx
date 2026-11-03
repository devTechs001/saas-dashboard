import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Stepper, Step, StepLabel, Typography, Button, Stack, TextField, MenuItem,
  Chip, Card, CardContent, Grid, Avatar, IconButton, useTheme, alpha, Alert,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import BusinessIcon from '@mui/icons-material/BusinessOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import GroupAddIcon from '@mui/icons-material/GroupAddOutlined';
import PartyPopperIcon from '@mui/icons-material/CelebrationOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { setMode, setAccent } from '../../store/slices/themeSlice';
import { updateUser } from '../../store/slices/authSlice.jsx';
import { AppAvatar, GradientText } from '../../components/ui';
import { ACCENTS } from '../../theme';
import { getInitials, getAvatarColor } from '../../utils/format';
import toast from 'react-hot-toast';
import { playSuccessSound } from '../../utils/sound';

const STEPS = ['Welcome', 'Your profile', 'Workspace', 'Personalize', 'Invite team', 'Done'];

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Media', 'Other'];
const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

const Onboarding = ({ onComplete }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);
  const mode = useSelector((state) => state.theme.mode);
  const accent = useSelector((state) => state.theme.accent);

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState({
    name: user?.name || '',
    title: '',
    avatar: user?.avatar || '',
    company: '',
    industry: INDUSTRIES[0],
    companySize: COMPANY_SIZES[0],
    invites: [],
  });
  const [inviteInput, setInviteInput] = useState('');

  const set = (patch) => setData((d) => ({ ...d, ...patch }));

  const handleNext = () => {
    if (activeStep === 1 && !data.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (activeStep === STEPS.length - 1) {
      handleFinish();
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleFinish = () => {
    dispatch(updateUser({ name: data.name, avatar: data.avatar, title: data.title }));
    localStorage.setItem('onboardingData', JSON.stringify(data));
    playSuccessSound();
    toast.success('Welcome to Nexus! 🎉');
    if (onComplete) onComplete();
    navigate('/dashboard');
  };

  const addInvite = () => {
    const email = inviteInput.trim();
    if (!email || !email.includes('@')) return;
    if (data.invites.includes(email)) return;
    set({ invites: [...data.invites, email] });
    setInviteInput('');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('Image must be under 1 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set({ avatar: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Top bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{
            width: 38, height: 38, borderRadius: 2.25, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff',
          }}>
            <RocketLaunchIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={800}>Nexus Setup</Typography>
        </Stack>
        <Button color="inherit" size="small" endIcon={<CloseIcon fontSize="small" />} onClick={handleFinish}>
          Skip for now
        </Button>
      </Stack>

      {/* Stepper */}
      <Box sx={{ px: { xs: 2, md: 6 }, maxWidth: 1000, mx: 'auto', width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, py: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            STEP {activeStep + 1} / {STEPS.length}
          </Typography>
          <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover' }}>
            <Box sx={{ width: `${((activeStep + 1) / STEPS.length) * 100}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #6366F1, #A78BFA)' }} />
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, py: 3, maxWidth: 1000, mx: 'auto', width: '100%' }}>
        {/* ===== Welcome ===== */}
        {activeStep === 0 && (
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="GETTING STARTED" color="primary" variant="outlined" sx={{ fontWeight: 700, mb: 2 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' }, lineHeight: 1.15 }}>
                Welcome aboard, <GradientText>{(data.name || 'friend').split(' ')[0]}</GradientText> 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
                Let's set up your workspace in under two minutes. We'll personalize your
                profile, theme, and team — you can change everything later in Settings.
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 3 }}>
                {['Personalized dashboards & AI insights', 'Real-time collaboration & notifications', 'Enterprise-grade security & roles'].map((t) => (
                  <Stack key={t} direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'success.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckIcon sx={{ fontSize: 14 }} />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Box component="img" src="/images/hero-dashboard.png" alt="Dashboard preview" sx={{ width: '100%', display: 'block' }} />
              </Box>
            </Grid>
          </Grid>
        )}

        {/* ===== Profile ===== */}
        {activeStep === 1 && (
          <Card sx={{ maxWidth: 640, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight={800}>Your profile</Typography>
                  <Typography variant="body2" color="text.secondary">How teammates will see you</Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                <Avatar src={data.avatar || undefined} sx={{ width: 84, height: 84, bgcolor: getAvatarColor(data.name), fontSize: '1.6rem', fontWeight: 800 }}>
                  {getInitials(data.name)}
                </Avatar>
                <Box>
                  <Button variant="outlined" component="label" size="small" sx={{ borderRadius: 2, mr: 1 }}>
                    Upload photo
                    <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                  </Button>
                  {data.avatar && (
                    <Button size="small" color="inherit" onClick={() => set({ avatar: '' })}>Remove</Button>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    JPG or PNG, max 1 MB. We'll generate initials if you skip this.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Full name" value={data.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ada Lovelace" autoFocus />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Job title" value={data.title} onChange={(e) => set({ title: e.target.value })} placeholder="Head of Revenue Operations" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ===== Workspace ===== */}
        {activeStep === 2 && (
          <Card sx={{ maxWidth: 640, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <BusinessIcon color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight={800}>Your workspace</Typography>
                  <Typography variant="body2" color="text.secondary">Tell us about your company</Typography>
                </Box>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Company name" value={data.company} onChange={(e) => set({ company: e.target.value })} placeholder="Acme Inc." autoFocus />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Industry" value={data.industry} onChange={(e) => set({ industry: e.target.value })}>
                    {INDUSTRIES.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Company size" value={data.companySize} onChange={(e) => set({ companySize: e.target.value })}>
                    {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* ===== Personalize ===== */}
        {activeStep === 3 && (
          <Card sx={{ maxWidth: 720, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <PaletteIcon color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight={800}>Make it yours</Typography>
                  <Typography variant="body2" color="text.secondary">Pick a mode and accent color</Typography>
                </Box>
              </Stack>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { key: 'light', label: 'Light', preview: 'linear-gradient(135deg, #F6F7FB 50%, #fff 50%)' },
                  { key: 'dark', label: 'Dark', preview: 'linear-gradient(135deg, #0B1020 50%, #111731 50%)' },
                  { key: 'system', label: 'System', preview: 'linear-gradient(135deg, #F6F7FB 50%, #111731 50%)' },
                ].map((m) => (
                  <Grid item xs={4} key={m.key}>
                    <Box
                      onClick={() => dispatch(setMode(m.key))}
                      sx={{
                        p: 1.5, borderRadius: 2.5, cursor: 'pointer', border: '2px solid',
                        borderColor: mode === m.key ? 'primary.main' : 'divider',
                      }}
                    >
                      <Box sx={{ height: 56, borderRadius: 1.75, background: m.preview, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                        {mode === m.key && (
                          <Box sx={{ position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon sx={{ fontSize: 13 }} />
                          </Box>
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 1 }}>{m.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>Accent color</Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {Object.entries(ACCENTS).map(([key, a]) => (
                  <Box
                    key={key}
                    onClick={() => dispatch(setAccent(key))}
                    sx={{
                      width: 76, p: 1.25, borderRadius: 2.25, cursor: 'pointer', textAlign: 'center',
                      border: '2px solid', borderColor: accent === key ? 'primary.main' : 'divider',
                    }}
                  >
                    <Box sx={{
                      width: 34, height: 34, borderRadius: '50%', mx: 'auto',
                      background: `linear-gradient(135deg, ${a.main}, ${a.dark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      {accent === key && <CheckIcon sx={{ fontSize: 15 }} />}
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mt: 0.5 }}>{a.name}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* ===== Invite team ===== */}
        {activeStep === 4 && (
          <Card sx={{ maxWidth: 640, mx: 'auto' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <GroupAddIcon color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight={800}>Invite your team</Typography>
                  <Typography variant="body2" color="text.secondary">Nexus is better together (optional)</Typography>
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth size="small" label="Email address" placeholder="teammate@company.com"
                  value={inviteInput} onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInvite(); } }}
                />
                <Button variant="contained" onClick={addInvite} sx={{ whiteSpace: 'nowrap', borderRadius: 2.5 }}>Add</Button>
              </Stack>
              {data.invites.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {data.invites.map((email) => (
                    <Chip
                      key={email} label={email} onDelete={() => set({ invites: data.invites.filter((i) => i !== email) })}
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              )}
              <Alert severity="info" sx={{ mt: 2.5, borderRadius: 2.5 }}>
                Invitations are sent after setup. You can manage members anytime in the Admin console.
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* ===== Done ===== */}
        {activeStep === 5 && (
          <Card sx={{ maxWidth: 640, mx: 'auto', textAlign: 'center' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box sx={{
                width: 84, height: 84, borderRadius: 4, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #D1FAE5, transparent)', color: 'success.main', mb: 2,
              }}>
                <PartyPopperIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h3" fontWeight={800}>You're all set!</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
                Your workspace is ready{data.company ? ` for ${data.company}` : ''}.
                {data.invites.length > 0 && ` We'll send ${data.invites.length} invitation${data.invites.length > 1 ? 's' : ''}.`}
              </Typography>
              <Stack direction="row" spacing={1.25} justifyContent="center" sx={{ mt: 3, flexWrap: 'wrap', useFlexGap: true }}>
                <Chip icon={<CheckIcon sx={{ fontSize: '16px !important' }} />} label="Profile created" variant="outlined" />
                <Chip icon={<CheckIcon sx={{ fontSize: '16px !important' }} />} label="Theme personalized" variant="outlined" />
                {data.invites.length > 0 && <Chip icon={<CheckIcon sx={{ fontSize: '16px !important' }} />} label={`${data.invites.length} invite${data.invites.length > 1 ? 's' : ''} queued`} variant="outlined" />}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Footer nav */}
      <Stack
        direction="row" justifyContent="space-between" alignItems="center"
        sx={{ px: { xs: 2, md: 4 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', maxWidth: 1000, mx: 'auto', width: '100%' }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          disabled={activeStep === 0}
          sx={{ borderRadius: 2.5 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={activeStep === STEPS.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
          onClick={handleNext}
          sx={{ borderRadius: 2.5, px: 3 }}
        >
          {activeStep === STEPS.length - 1 ? 'Open my dashboard' : 'Continue'}
        </Button>
      </Stack>
    </Box>
  );
};

export default Onboarding;
