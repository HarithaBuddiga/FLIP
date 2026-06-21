import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Menu,
  MenuItem, IconButton, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AutoStories as DecksIcon,
  AdminPanelSettings as AdminIcon,
  PlayCircleOutline as LearnIcon,
  Quiz as QuizIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from '../BrandLogo';

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'My Decks', icon: <DecksIcon />, path: '/decks' },
  { label: 'Explore', icon: <LearnIcon />, path: '/explore' },
  { label: 'Study Hub', icon: <QuizIcon />, path: '/study-hub' },
  { label: 'Admin', icon: <AdminIcon />, path: '/admin', adminOnly: true },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1.25 }}>
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <BrandLogo size={38} />
      </Box>

      <Box sx={{ px: 1.5, mt: 1 }}>
        <List disablePadding>
          {navItems.filter((item) => !item.adminOnly || user?.role === 'admin').map(({ label, icon, path }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <ListItem key={path} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton selected={isActive} onClick={() => handleNavClick(path)} sx={{ py: 1, px: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 38, color: isActive ? 'primary.main' : 'text.secondary' }}>
                    {React.cloneElement(icon, { sx: { fontSize: 20 } })}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: 'auto', px: 1.5, pb: 1 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 1.5, py: 1, borderRadius: 2, cursor: 'pointer',
            '&:hover': { bgcolor: 'grey.100' }, transition: 'background 0.15s',
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
          </Box>
          <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 3 } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, color: 'text.primary' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <BrandLogo size={30} subtitle={false} compact />
          </Toolbar>
        </AppBar>
      )}

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer variant="permanent" sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, position: 'fixed', height: '100vh' } }}>
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: { xs: '64px', md: 0 },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
