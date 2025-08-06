/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // La expresión regular ahora solo ignora la carpeta ./functions/ de la raíz
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/functions\//,
      })
    );
    return config;
  },
};

export default nextConfig;