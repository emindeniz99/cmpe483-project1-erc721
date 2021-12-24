import React, { createContext, useEffect, useState } from "react";
import Web3 from "web3";
const Web3jsContext = createContext<{
  web3: Web3 | null;
}>({
  web3: null,
});

interface Props {}

const Web3js: React.FC<Props> = (props) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    (async () => {
      if ((window as any).ethereum) {
        (window as any).web3 = new Web3((window as any).ethereum);

        setWeb3((window as any).web3);
        await (window as any).ethereum.enable();
      } else if ((window as any).web3) {
        setWeb3(new Web3((window as any).web3.currentProvider));
      } else {
        window.alert(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    })();
  }, []);
  if (!web3) {
    return <div>Please, install metamask</div>;
  } else {
    return (
      <Web3jsContext.Provider value={{ web3 }}>
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
