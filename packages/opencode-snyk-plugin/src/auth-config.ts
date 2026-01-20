/**
 * Authentication configuration for the Snyk plugin
 */

/**
 * Snyk authentication configuration
 */
export const snykAuthConfig = {
  provider: 'snyk' as const,
  loader: async (authFunc, provider) => {
    // Load Snyk authentication from stored credentials
    const auth = await authFunc();
    if (auth.type === 'api') {
      const apiKey = (auth as any).key || (auth as any).access;
      // Use provider field if custom baseUrl was provided, else use env or default
      const baseUrl =
        (provider as any).provider !== 'snyk'
          ? (provider as any).provider
          : process.env.SNYK_API_URL || 'https://api.snyk.io';

      return {
        token: apiKey,
        baseUrl,
      };
    }
    throw new Error(`Unsupported auth type: ${auth.type}`);
  },
  methods: [
    {
      type: 'api' as const,
      label: 'Snyk API Token',
      prompts: [
        {
          type: 'text' as const,
          key: 'token',
          message: 'Enter your Snyk API token',
          placeholder: 'Get your token from https://app.snyk.io/account',
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return 'API token is required';
            }
            return undefined;
          },
        },
        {
          type: 'text' as const,
          key: 'baseUrl',
          message: 'Enter Snyk API base URL (optional)',
          placeholder: 'https://api.snyk.io',
        },
      ],
      authorize: async (inputs) => {
        const token = inputs?.token;
        const baseUrl = inputs?.baseUrl || 'https://api.snyk.io';

        if (!token) {
          return { type: 'failed' as const };
        }

        // Store the token as the key
        return {
          type: 'success' as const,
          key: token,
          provider: baseUrl !== 'https://api.snyk.io' ? baseUrl : undefined,
        };
      },
    },
  ],
};
