import { composePlugins, withNx } from '@nx/next';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const nextConfig = {
  nx: {},
  allowedDevOrigins: ['ticketing.dev', 'localhost:3000'],
  typescript: {
    tsconfigPath: 'tsconfig.app.json',
  },
};

const plugins = [withNx];

export default composePlugins(...plugins)(nextConfig);
