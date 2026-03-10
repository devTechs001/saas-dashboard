import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';

const TopPages = ({ pages }) => {
  if (!pages || pages.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Pages
          </Typography>
          <Typography color="text.secondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Pages
        </Typography>
        <List>
          {pages.map((page, index) => (
            <ListItem
              key={page.path}
              sx={{
                px: 0,
                borderBottom: index < pages.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'grey.300',
                  color: index < 3 ? '#000' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  mr: 2,
                }}
              >
                {index + 1}
              </Box>
              <ListItemText
                primary={
                  <Typography
                    component={RouterLink}
                    to={page.path}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {page.path}
                  </Typography>
                }
                secondary={`${page.views.toLocaleString()} views`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

TopPages.propTypes = {
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      views: PropTypes.number,
    })
  ),
};

export default TopPages;
