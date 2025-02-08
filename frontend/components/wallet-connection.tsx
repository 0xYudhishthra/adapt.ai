import { ConnectWallet, WalletDefault } from '@coinbase/onchainkit/wallet';
import { useState } from 'react';

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="wallet-container">
      <ConnectWallet
        onConnect={(wallet) => {
          setIsConnected(true);
          console.log('Connected wallet:', wallet);
        }}
        onDisconnect={() => {
          setIsConnected(false);
          console.log('Disconnected wallet');
        }}
      >
        {isConnected ? (
          <WalletDefault />
        ) : (
          <button className="connect-button">
            Connect Wallet
          </button>
        )}
      </ConnectWallet>
    </div>
  );
};

export default WalletConnect;