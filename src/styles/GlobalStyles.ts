import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.font.sans};
    background-color: ${({ theme }) => theme.bg.primary};
    color: ${({ theme }) => theme.text.primary};
    line-height: 1.5;
    min-height: 100vh;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, textarea, select {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border.default};
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.text.muted};
  }
`;
