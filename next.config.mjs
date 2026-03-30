/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js", "@supabase/phoenix"]
  },
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
