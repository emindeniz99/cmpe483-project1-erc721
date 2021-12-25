import React, { createContext, useEffect, useState } from "react";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";

// https://ethereum.stackexchange.com/questions/94601/trouble-with-web3-eth-contract-abi-usage-with-typescript
// https://ethereum.stackexchange.com/questions/65662/contract-deployment-using-web3-eth-contractabi-with-constructor-arguments/91643
import compiledStateContract from "../../truffle/build/contracts/StateContract.json";
import compiledProductContract from "../../truffle/build/contracts/ProductContract.json";

const Web3jsContext = createContext<{
  web3: Web3 | undefined;
  selectedAccountAddress: string | undefined;
  stateContract: Contract | undefined;
  productContract: Contract | undefined;
}>({
  web3: undefined,
  selectedAccountAddress: undefined,
  stateContract: undefined,
  productContract: undefined,
});

interface Props {}

const Web3js: React.FC<Props> = (props) => {
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [stateContract, setstateContract] = useState<Contract | undefined>(
    undefined
  );
  const [productContract, setproductContract] = useState<Contract | undefined>(
    undefined
  );

  const [selectedAccountAddress, setselectedAccountAddress] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    (window as any).selectedAccountAddress = selectedAccountAddress;
  }, [selectedAccountAddress]);

  useEffect(() => {
    if (web3) {
      (window as any).stateContract = new web3.eth.Contract(
        compiledStateContract.abi as AbiItem[]
      );
      setstateContract((window as any).stateContract);

      (window as any).productContract = new web3.eth.Contract(
        compiledProductContract.abi as AbiItem[]
      );
      setproductContract((window as any).productContract);
    }
  }, [web3]);

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

  function handleAccountsChanged(accounts: string[]) {
    console.log(accounts);
    // metamask supports only one account
    setselectedAccountAddress(accounts[0]);
  }

  useEffect(() => {
    if (web3) {
      // https://docs.metamask.io/guide/accessing-accounts.html
      // https://docs.metamask.io/guide/ethereum-provider.html#events
      (web3?.eth?.currentProvider as any).on(
        "accountsChanged",
        handleAccountsChanged
      );

      // https://docs.metamask.io/guide/ethereum-provider.html#events
      (web3?.eth?.currentProvider as any).on(
        "chainChanged",
        (chainId: number) => {
          // Handle the new chain.
          // Correctly handling chain changes can be complicated.
          // We recommend reloading the page unless you have good reason not to.
          window.location.reload();
        }
      );
    }
    return () => {
      if (web3) {
        (web3?.eth?.currentProvider as any).removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [web3]);

  if (!web3 || !selectedAccountAddress || !stateContract || !productContract) {
    return <div>Please, install metamask and select account</div>;
  } else {
    return (
      <Web3jsContext.Provider
        value={{ web3, selectedAccountAddress, stateContract, productContract }}
      >
        <div style={{ margin: "2rem", backgroundColor: "yellow" }}>
          selectedAccountAddress:{selectedAccountAddress}
        </div>
        {props.children}
      </Web3jsContext.Provider>
    );
  }
};
interface Web3ContextType {
  web3: Web3;
  selectedAccountAddress: string;
  stateContract: Contract;
  productContract: Contract;
}
const useWeb3 = () => {
  return React.useContext<Web3ContextType>(
    Web3jsContext as React.Context<Web3ContextType>
  );
};

export default Web3js;

export { useWeb3, compiledStateContract, compiledProductContract };
