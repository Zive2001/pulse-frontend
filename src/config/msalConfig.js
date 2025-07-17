// src/config/msalConfig.js
import { Configuration, LogLevel } from '@azure/msal-browser';

// MSAL Configuration
export const msalConfig = {
  auth: {
    clientId: '8a31634b-d397-48f3-881e-95c21b3ead5f', // Replace with your Application (client) ID
    authority: 'https://login.microsoftonline.com/519f28ec-a14a-45a5-8697-409b75aeadca', // Replace with your Directory (tenant) ID
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Login request configuration
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

// Graph API request configuration
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};