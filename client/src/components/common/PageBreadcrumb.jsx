import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PropTypes from 'prop-types';

const PageBreadcrumb = ({ items = [] }) => {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.href || index}>
          {index === items.length - 1 ? (
            <Typography color="text.primary">{item.label}</Typography>
          ) : (
            <Link
              component={RouterLink}
              to={item.href}
              color="inherit"
              underline="hover"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </Breadcrumbs>
  );
};

PageBreadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ),
};

export default PageBreadcrumb;
