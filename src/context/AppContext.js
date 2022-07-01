import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from "wouter";

const defaultContext = {
  walletAddress: undefined,
  walletError: undefined,
  goHome: () => {}
};

const AppContext = createContext(defaultContext);

export const useAppContext = () => useContext(AppContext)

export const ProvideAppContext = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState();
  const [walletError, setWallerError] = useState();
  const [, setLocation] = useLocation();
  const [identity, setIdentity] = useState();
  const [publicKey, setPublicKey] = useState();

  useEffect(() => {
    (async () => {
      try {
        const {data: {address}} = await window.point.wallet.address();
        setWalletAddress(address);
        const result = await window.point.identity.ownerToIdentity({
          owner: address,
        });
        setIdentity(result.data.identity);

        const result2 = await window.point.identity.publicKeyByIdentity({
          identity: result.data.identity
        });
        setPublicKey(result2.data.publicKey);

      } catch (e) {
        setWallerError(e);
      }
    })()
  }, [])

  const goHome = useCallback(async () => {
    setLocation('/');
  }, []);

  const context = {
    walletAddress,
    walletError,
    identity,
    publicKey,
    goHome
  }

  return <AppContext.Provider value={ context }>{ children }</AppContext.Provider>
}
