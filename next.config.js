/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/akun/proyek", destination: "/akun/project", permanent: true },
      { source: "/akun/proyek/:path*", destination: "/akun/project/:path*", permanent: true },
    ];
  },
};
