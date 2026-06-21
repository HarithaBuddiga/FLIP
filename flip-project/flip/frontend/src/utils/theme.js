import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A2F6B',
      light: '#1E5AA8',
      dark: '#061D42',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#14B8A6',
      light: '#5EEAD4',
      dark: '#0F766E',
      contrastText: '#ffffff',
    },
    error: { main: '#F43F5E' },
    warning: { main: '#F59E0B' },
    success: { main: '#10B981' },
    grey: {
      50: '#F7FAFC',
      100: '#EEF6F7',
      200: '#DCE9ED',
      300: '#C4D7DE',
      400: '#8AA2AF',
      500: '#617886',
      600: '#405665',
      700: '#293E4C',
      800: '#172B38',
      900: '#071A25',
    },
    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#071A25',
      secondary: '#526978',
      disabled: '#9BAAB4',
    },
    divider: '#DDEAF0',
  },
  typography: {
    fontFamily: '"Nunito", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 900, fontSize: '2.5rem', lineHeight: 1.08, letterSpacing: 0 },
    h2: { fontWeight: 900, fontSize: '2rem', lineHeight: 1.15, letterSpacing: 0 },
    h3: { fontWeight: 900, fontSize: '1.65rem', lineHeight: 1.2, letterSpacing: 0 },
    h4: { fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.25, letterSpacing: 0 },
    h5: { fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.35, letterSpacing: 0 },
    h6: { fontWeight: 800, fontSize: '1rem', lineHeight: 1.4, letterSpacing: 0 },
    body1: { fontSize: '0.96rem', lineHeight: 1.65, letterSpacing: 0 },
    body2: { fontSize: '0.88rem', lineHeight: 1.55, letterSpacing: 0 },
    caption: { fontSize: '0.74rem', lineHeight: 1.45, letterSpacing: 0 },
    button: { fontWeight: 800, textTransform: 'none', letterSpacing: 0 },
  },
  shape: { borderRadius: 22 },
  shadows: [
    'none',
    '0 8px 24px rgb(124 58 237 / 0.08)',
    '0 12px 32px rgb(76 29 149 / 0.10)',
    '0 18px 44px rgb(76 29 149 / 0.12)',
    '0 24px 60px rgb(76 29 149 / 0.16)',
    ...Array(20).fill('0 28px 80px rgb(76 29 149 / 0.18)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body {
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 8%, rgba(20, 184, 166, 0.16), transparent 28%),
            radial-gradient(circle at 92% 10%, rgba(245, 158, 11, 0.10), transparent 24%),
            linear-gradient(180deg, #FFFFFF 0%, #F7FAFC 58%, #EEF6F7 100%);
        }
        ::selection { background: #BFEFE8; color: #061D42; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          padding: '10px 18px',
          minHeight: 44,
          boxShadow: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0A2F6B 0%, #0B4F7E 58%, #14B8A6 100%)',
          boxShadow: '0 14px 28px rgb(10 47 107 / 0.22)',
          '&:hover': {
            boxShadow: '0 18px 34px rgb(10 47 107 / 0.30)',
          },
        },
        outlined: {
          borderColor: '#DDEAF0',
          backgroundColor: 'rgba(255,255,255,0.72)',
        },
        sizeLarge: { minHeight: 54, padding: '12px 24px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '1px solid rgba(232, 225, 247, 0.9)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))',
          boxShadow: '0 18px 44px rgb(76 29 149 / 0.10)',
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.82)',
            '& fieldset': { borderColor: '#DDEAF0' },
            '&:hover fieldset': { borderColor: '#8BDDD4' },
            '&.Mui-focused fieldset': { borderColor: '#0A2F6B', borderWidth: '1.5px' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
          backgroundColor: '#E8F7F5',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          borderRight: '1px solid #DDEAF0',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid #DDEAF0',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          margin: '3px 8px',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(10,47,107,0.12), rgba(20,184,166,0.12))',
            color: '#0A2F6B',
            '& .MuiListItemIcon-root': { color: '#0A2F6B' },
          },
        },
      },
    },
  },
});

export default theme;
