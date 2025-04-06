import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import { FaHome, FaBookmark, FaCompass, FaPodcast } from 'react-icons/fa';

const navItems = [
  { label: 'Home', icon: <FaHome />, to: '/home' },
  { label: 'Discover', icon: <FaCompass />, to: '/discover' },
  { label: 'Saved Courses', icon: <FaBookmark />, to: '/saved' },
  { label: 'Podcasts', icon: <FaPodcast />, to: '/podcasts' },
];

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#0f0f0f',
          color: 'white',
          borderRight: '1px solid #333',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2, py: 4, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#a855f7', fontWeight: 700 }}>
          WildRec
        </Typography>
      </Box>

      {/* Navigation Links */}
      <List>
        {navItems.map((item) => (
          <NavLink
            to={item.to}
            key={item.label}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <ListItemButton
                sx={{
                  px: 3,
                  color: isActive ? '#a855f7' : '#ccc',
                  '&:hover': { bgcolor: '#1f1f1f' },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#a855f7' : '#ccc', minWidth: 30 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>

    </Drawer>
  );
};

export default Sidebar;