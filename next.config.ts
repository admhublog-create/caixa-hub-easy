import type {NextConfig} from "next";
const nextConfig:NextConfig={
 async redirects(){return [
  {source:"/retirada/pp",destination:"/qr/pp",permanent:false},
  {source:"/retirada/p",destination:"/qr/p",permanent:false},
  {source:"/retirada/m",destination:"/qr/m",permanent:false},
 ];},
};
export default nextConfig;
