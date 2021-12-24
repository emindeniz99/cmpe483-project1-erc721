import React, { createContext, useEffect, useState } from "react";
import Web3 from "web3";
const Web3jsContext = createContext<{
  web3: Web3 | null;
  selectedAccountAddress: string | undefined;
}>({
  web3: null,
  selectedAccountAddress: undefined,
});

interface Props {}

const Web3js: React.FC<Props> = (props) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [selectedAccountAddress, setselectedAccountAddress] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    (async () => {
      if ((window as any).ethereum) {
        (window as any).web3 = new Web3((window as any).ethereum);

        setWeb3((window as any).web3);
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setselectedAccountAddress(accounts[0]);
      } else if ((window as any).web3) {
        setWeb3(new Web3((window as any).web3.currentProvider));
      } else {
        window.alert(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (web3) {
      // https://docs.metamask.io/guide/accessing-accounts.html
      (web3?.eth?.currentProvider as any).on(
        "accountsChanged",
        function (accounts: string[]) {
          console.log(accounts);
          // metamask supports only one account
          setselectedAccountAddress(accounts[0]);
        }
      );
    }
  }, [web3]);
  if (!web3) {
    return <div>Please, install metamask</div>;
  } else {
    return (
      <Web3jsContext.Provider value={{ web3, selectedAccountAddress }}>
        <div style={{ margin: "2rem", backgroundColor: "yellow" }}>
          selectedAccountAddress:{selectedAccountAddress}
        </div>
        {props.children}
      </Web3jsContext.Provider>
    );
  }
};
const useWeb3 = () => {
  return React.useContext(Web3jsContext);
};

export default Web3js;

export { useWeb3 };
