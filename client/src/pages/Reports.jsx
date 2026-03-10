import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PageBreadcrumb, LoadingSpinner, ConfirmDialog } from '../components/common';
import { reportService } from '../services';

const Reports = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'analytics',
    description: '',
    chartType: 'table',
    isPublic: false,
  });

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', { type: typeFilter }],
    queryFn: () => reportService.getAll({ type: typeFilter }),
    select: (data) => data.data,
  });

  const createMutation = useMutation({
    mutationFn: (data) => reportService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Report created successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create report');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => reportService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Report updated successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update report');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => reportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      toast.success('Report deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    },
  });

  const handleOpenDialog = (report = null) => {
    if (report) {
      setSelectedReport(report);
      setFormData({
        name: report.name || '',
        type: report.type || 'analytics',
        description: report.description || '',
        chartType: report.chartType || 'table',
        isPublic: report.isPublic || false,
      });
    } else {
      setSelectedReport(null);
      setFormData({
        name: '',
        type: 'analytics',
        description: '',
        chartType: 'table',
        isPublic: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const handleSubmit = () => {
    if (selectedReport) {
      updateMutation.mutate({ id: selectedReport._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedReport) {
      deleteMutation.mutate(selectedReport._id);
    }
  };

  const getChartTypeIcon = (type) => {
    switch (type) {
      case 'bar':
        return '📊';
      case 'line':
        return '📈';
      case 'pie':
        return '🥧';
      case 'area':
        return '📉';
      default:
        return '📋';
    }
  };

  const reports = reportsData?.reports || [];

  return (
    <Box>
      <PageBreadcrumb items={[{ label: 'Reports' }]} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Report
        </Button>
      </Box>

      <Box mb={3}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="analytics">Analytics</MenuItem>
            <MenuItem value="crm">CRM</MenuItem>
            <MenuItem value="revenue">Revenue</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <LoadingSpinner message="Loading reports..." />
      ) : reports.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No reports yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first report to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} md={6} lg={4} key={report._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { boxShadow: 6 },
                  transition: 'box-shadow 0.3s',
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {getChartTypeIcon(report.chartType)} {report.name}
                      </Typography>
                      <Chip
                        label={report.type}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    {report.isPublic && (
                      <Chip label="Public" size="small" color="success" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {report.description || 'No description'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Created:{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(report)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedReport(report);
                          setDeleteDialogOpen(true);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReport ? 'Edit Report' : 'Create Report'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Report Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={formData.type}
                label="Report Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="analytics">Analytics</MenuItem>
                <MenuItem value="crm">CRM</MenuItem>
                <MenuItem value="revenue">Revenue</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={formData.chartType}
                label="Chart Type"
                onChange={(e) => setFormData({ ...formData, chartType: e.target.value })}
              >
                <MenuItem value="table">Table</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="area">Area Chart</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.isPublic ? 'public' : 'private'}
                label="Visibility"
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.value === 'public' })
                }
              >
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="public">Public</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Report"
        message={`Are you sure you want to delete "${selectedReport?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
};

export default Reports;
