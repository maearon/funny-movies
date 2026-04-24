import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/rails/active_storage/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // dangerouslyAllowSVG: true,
    // dangerouslyAllowLocalIP: true,
    // https://res.cloudinary.com/dq7vadalc/image/upload/5c3j3nnlsl9i08hrq1zedgdb2j2m.jpg?_a=BACJ3SAE
    // https://github.com/maearon/adidas-microservices/blob/main/apps/ruby-rails-boilerplate/app/controllers/api/admin/products_controller.rb
  },
};

export default nextConfig;
