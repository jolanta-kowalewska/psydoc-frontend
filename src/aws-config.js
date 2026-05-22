const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      region: import.meta.env.VITE_REGION ?? 'eu-central-1',
    },
  },
  Api: {
    url: import.meta.env.VITE_API_URL,
  },
};

export default awsConfig;
