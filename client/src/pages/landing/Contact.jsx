import React from 'react';
import {
  Box, Typography, Stack, Grid, Container, Chip, Card, CardContent, Button,
  TextField, MenuItem, useTheme, Alert, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgentOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import { LandingNav, Footer } from '../../components/layout';
import { GradientText } from '../../components/ui';
import { faqs } from '../../data/marketing';

const TOPICS = ['General enquiry', 'Sales & pricing', 'Product support', 'Partnerships', 'Security review', 'Careers'];

const CHANNELS = [
  { icon: <EmailIcon fontSize="large" />, title: 'Email us', desc: 'support@nexus.io — we reply within one business day.', action: 'Send an email' },
  { icon: <ChatIcon fontSize="large" />, title: 'Live chat', desc: 'Chat with the team right from your dashboard, 24/5.', action: 'Open the app' },
  { icon: <SupportAgentIcon fontSize="large" />, title: 'Book a call', desc: 'Talk solutions with a product specialist — 30 minutes.', action: 'Schedule now' },
];

const Contact = () => {
  const theme = useTheme();
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', company: '', topic: TOPICS[0], message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingNav />

      {/* Header */}
      <Box sx={{
        pt: { xs: 14, md: 17 }, pb: { xs: 4, md: 6 }, px: 2,
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(900px 420px at 50% -10%, rgba(14,165,233,0.16), transparent 65%)'
          : 'radial-gradient(900px 420px at 50% -10%, rgba(14,165,233,0.1), transparent 65%)',
      }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={2.5}>
            <Chip label="GET IN TOUCH" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 3 }} />
            <Typography variant="h1" align="center" sx={{ fontSize: { xs: '2.25rem', md: '3.35rem' }, lineHeight: 1.12 }}>
              Talk to a <GradientText>human</GradientText>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 400, lineHeight: 1.75 }}>
              Questions, feedback, or a full security review — our team reads every message and responds fast.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Channels */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Grid container spacing={3}>
          {CHANNELS.map((c) => (
            <Grid item xs={12} md={4} key={c.title}>
              <Card sx={{ height: '100%', textAlign: 'center', transition: '0.25s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 16px 36px rgba(14,165,233,0.18)' } }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{
                    width: 60, height: 60, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                    background: 'linear-gradient(135deg, #E0F2FE, transparent)', color: '#0284C7',
                  }}>
                    {c.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, mb: 2 }}>{c.desc}</Typography>
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2.5 }}>{c.action}</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Form + image */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
                {submitted ? (
                  <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
                    <Typography variant="h5" fontWeight={800}>Message sent!</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 360 }}>
                      Thanks {form.name || 'there'} — we've received your message and will reply to{' '}
                      {form.email || 'your inbox'} within one business day.
                    </Typography>
                    <Button variant="outlined" onClick={() => setSubmitted(false)}>Send another</Button>
                  </Stack>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <Typography variant="h5" fontWeight={800} gutterBottom>Send us a message</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Fill in the form and the right person on our team will get back to you.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth required label="Your name" size="small" value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth required type="email" label="Work email" size="small" value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Company" size="small" value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth select label="Topic" size="small" value={form.topic}
                          onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                          {TOPICS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth required multiline minRows={4} label="How can we help?"
                          placeholder="Tell us a little about what you're trying to achieve…"
                          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" fullWidth variant="contained" size="large" sx={{ borderRadius: 2.5, py: 1.4 }}>
                          Send message
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
                          By submitting, you agree to our privacy policy.
                        </Typography>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Box sx={{
                borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', flex: 1, minHeight: 280,
              }}>
                <Box
                  component="img"
                  src={new URL('../../assets/contact-visual.png', import.meta.url).href}
                  alt="Nexus support team"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <LocationOnIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>Headquarters</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                        Riverside Green, Riverside Drive<br />Nairobi, Kenya<br />
                        Remote hubs: San Francisco · Berlin · Toronto
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* FAQ */}
      <Box sx={{ py: { xs: 5, md: 8 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.3rem' } }}>Quick answers</Typography>
            <Typography variant="body1" color="text.secondary">Common questions, before you write in.</Typography>
          </Stack>
          {faqs.map((f) => (
            <Accordion key={f.q} disableGutters sx={{ borderRadius: 3, mb: 1.5, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={700}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Contact;
