// src/config/msalConfig.js
import { LogLevel } from '@azure/msal-browser';

// Remove Configuration from the import since it's not exported
// The msalConfig object structure is correct as-is

export const msalConfig = {
  auth: {
    clientId: '8a31634b-d397-48f3-881e-95c21b3ead5f',
    authority: 'https://login.microsoftonline.com/519f28ec-a14a-45a5-8697-409b75aeadca',
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

export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};