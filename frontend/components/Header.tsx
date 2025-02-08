"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically load the wallet connector to ensure it only runs on the client.
const DynamicWallet = dynamic(
  () =>
    Promise.resolve(
      function WalletConnectorWrapper({ children }: { children: Function }) {
        const { ConnectWallet } = require("@coinbase/onchainkit/wallet");
        return <ConnectWallet>{(walletProps: any) => children(walletProps)}</ConnectWallet>;
      }
    ),
  {
    ssr: false,
    loading: () => <p>Loading wallet...</p>,
  }
);

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/ada1.png"
            alt="Adapt.ai Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-xl font-bold">Adapt.ai</span>
        </div>
        <DynamicWallet>
          {({ isConnected, isConnecting, error, WalletDefault }: any) => {
            // Log the state to debug it
            console.log({ isConnected, isConnecting, error });
            
            if (isConnecting) {
              return <p className="px-4">Connecting wallet…</p>;
            }
            
            if (error) {
              return (
                <p className="px-4 text-red-500">
                  {error?.message || "Error connecting wallet"}
                </p>
              );
            }
            
            if (isConnected) {
              // When connected, show WalletDefault (to display wallet info)
              // and a Disconnect button.
              return (
                <div className="flex items-center gap-2">
                  <WalletDefault />
                  <Button onClick={() => console.log("Disconnect wallet")}>
                    Disconnect
                  </Button>
                </div>
              );
            }
            
            return (
              <Button onClick={() => console.log("Connect wallet pressed")}>
                Connect Wallet
              </Button>
            );
          }}
        </DynamicWallet>
      </div>
    </motion.header>
  );
}

export default Header;