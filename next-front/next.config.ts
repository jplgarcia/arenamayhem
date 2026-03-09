import type { NextConfig } from "next";

const nodeUrl  = process.env.NODE_URL  ?? 'http://127.0.0.1:6751';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DAPP_ADDRESS:   process.env.DAPP_ADDRESS   ?? 'am-node',
    NEXT_PUBLIC_ERC20_ADDRESS:  process.env.ERC20_ADDRESS  ?? '0x5138f529B77B4e0a7c84B77E79c4335D31938fed',
    NEXT_PUBLIC_CHAIN_ID:       process.env.CHAIN_ID       ?? '31337',
    NEXT_PUBLIC_NODE_URL:       nodeUrl,
    NEXT_PUBLIC_RPC_URL:        `${nodeUrl}/rpc`,
  },
  async rewrites() {
    return [
      {
        source: '/inspect/:path*',
        destination: `${nodeUrl}/inspect/:path*`,
      },
      {
        source: '/rpc',
        destination: `${nodeUrl}/rpc`,
      },
    ];
  },
};

export default nextConfig;
