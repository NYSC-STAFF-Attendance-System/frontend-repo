import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Origins allowed to reach the dev server, on top of localhost.
   *
   * Next blocks cross-origin requests to dev-only assets by default, which
   * breaks hot reload the moment the app is opened on a phone or through a
   * tunnel rather than on the machine running it. Testing the QR scan needs
   * both: a real phone, and HTTPS, because browsers refuse geolocation on an
   * insecure origin.
   *
   * Development only - this has no effect on a production build.
   *
   * Add your machine's LAN address here if it differs. Find it with ipconfig
   * on Windows or ifconfig on macOS and Linux.
   */
  allowedDevOrigins: [
    // Windows Mobile Hotspot always hands the laptop this address, so a phone
    // tethered to the laptop reaches the dev server here regardless of which
    // network the laptop itself is on.
    "192.168.137.1",
    // Ordinary wifi. Changes whenever the laptop joins a different network -
    // check with ipconfig and add the new one here.
    "192.168.0.174",
    "192.168.123.146",
    // Quick tunnels, which hand out a fresh subdomain on every run.
    "*.loca.lt",
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
};

export default nextConfig;
