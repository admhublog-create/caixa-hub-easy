import type {NextConfig} from "next";

const nextConfig:NextConfig={
  async redirects(){
    return [
      {source:"/retirada/pp",destination:"/retirada/PP",permanent:false},
      {source:"/retirada/p",destination:"/retirada/P",permanent:false},
      {source:"/retirada/m",destination:"/retirada/M",permanent:false},
    ];
  },
};

export default nextConfig;
