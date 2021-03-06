import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { compiledStateContract, useWeb3 } from "../../components/Web3js";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
import { Contract } from "web3-eth-contract";

const Home: NextPage = () => {
  const router = useRouter();

  const _contractAddress = router.query.contractAddress as string;

  const { web3, selectedAccountAddress, productContract } = useWeb3();

  const [contractOwner, setcontractOwner] = useState("");
  const [contractAddress, setcontractAddress] = useState(_contractAddress);
  const [stateAddress, setstateAddress] = useState("");
  const [queryVerifiedAddress, setqueryVerifiedAddress] = useState("");
  const [verifiedAddress, setverifiedAddress] = useState("");
  const [verifiedResult, setverifiedResult] = useState("");

  const [lastTokenID, setLastTokenID] = useState(0);

  useEffect(() => {
    (async () => {
      if (_contractAddress) {
        productContract.options.address = _contractAddress as any;
        setcontractAddress(_contractAddress);
        setcontractOwner(
          await productContract.methods
            .manufacturer()
            .call({ from: selectedAccountAddress })
        );
        setstateAddress(
          await productContract.methods
            .stateContractAddress()
            .call({ from: selectedAccountAddress })
        );
        setLastTokenID(
          Number(await productContract.methods._tokenIds().call())
        );
      }
    })();
  }, [web3, selectedAccountAddress, _contractAddress]);
  return (
    <div className={styles.container}>
      <Head>
        <title>State - Deploy</title>
      </Head>

      <main className={styles.main}>
        <h1>Product Contract</h1>
        {contractAddress && (
          <div>
            Deployed Address:
            {contractAddress}
          </div>
        )}
        {contractOwner && (
          <div>
            Contract Owner:
            {contractOwner}
          </div>
        )}
        {stateAddress && (
          <div>
            State Address:
            {stateAddress}
          </div>
        )}

        {lastTokenID != 0 && (
          <div>
            Total number of tokens stored in this contract:
            {lastTokenID}
          </div>
        )}
        {lastTokenID != 0 && (
          <div>
            <br />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {[...new Array(lastTokenID)].map((_, index) => {
                const tokenid = index + 1;
                return (
                  <div
                    key={tokenid}
                    onClick={() => {
                      router.push(
                        `/product/${productContract.options.address}/${tokenid}`
                      );
                    }}
                    style={{
                      borderRadius: "50px",
                      height: "100px",
                      width: "100px",
                      backgroundColor: "yellow",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <span> {tokenid}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <TokenInput
          lastTokenID={lastTokenID}
          productaddress={contractAddress}
        />
        <TokenInputBySerialNumber
          lastTokenID={lastTokenID}
          productContract={productContract}
        />
        <MintToken productContract={productContract} />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

const TokenInput = ({
  productaddress,
  lastTokenID,
}: {
  productaddress: string;
  lastTokenID: Number;
}) => {
  const [tokenID, settokenID] = useState("");
  const router = useRouter();

  return (
    <div>
      Go to token:{" "}
      <input
        type="text"
        value={tokenID}
        onChange={(e) => settokenID(e.target.value)}
        placeholder="tokenID"
      />
      <button
        onClick={async () => {
          if (lastTokenID >= Number(tokenID) && Number(tokenID) >= 1) {
            router.push(`/product/${productaddress}/${tokenID}`);
          } else {
            alert("this token is not minted");
          }
        }}
      >
        go
      </button>
    </div>
  );
};

const TokenInputBySerialNumber = ({
  productContract,
  lastTokenID,
}: {
  productContract: Contract;
  lastTokenID: Number;
}) => {
  const [serialnumber, setserialnumber] = useState("");
  const router = useRouter();
  const { web3, selectedAccountAddress } = useWeb3();

  return (
    <div>
      Go to token by serial number:{" "}
      <input
        type="text"
        value={serialnumber}
        onChange={(e) => setserialnumber(e.target.value)}
        placeholder="serialnumber"
      />
      <button
        onClick={async () => {
          const tokenid = await productContract.methods
            .serialNumbers(serialnumber)
            .call({ from: selectedAccountAddress });
          console.log(
            "???? ~ file: [contractAddress].tsx ~ line 154 ~ onClick={ ~ tokenid",
            tokenid
          );

          if (lastTokenID >= Number(tokenid) && Number(tokenid) >= 1) {
            router.push(
              `/product/${productContract.options.address}/${tokenid}`
            );
          } else {
            alert("this token is not minted");
          }
        }}
      >
        go
      </button>
    </div>
  );
};

const MintToken = ({ productContract }: { productContract: Contract }) => {
  const [serialNumber, setserialNumber] = useState("");
  const [zipCode, setzipCode] = useState("");
  const router = useRouter();
  const { web3, selectedAccountAddress } = useWeb3();

  const [mintedTokens, setmintedTokens] = useState<
    { tokenID: number; serialNumber: string; zipCode: string }[]
  >([]);

  return (
    <div>
      Mint:{" "}
      <input
        type="text"
        value={serialNumber}
        onChange={(e) => setserialNumber(e.target.value)}
        placeholder="serialnumber"
      />
      <input
        type="text"
        value={zipCode}
        onChange={(e) => setzipCode(e.target.value)}
        placeholder="zipCode"
      />
      <button
        onClick={async () => {
          const resultMint = await productContract.methods
            .mint(serialNumber, zipCode)
            .send({ from: selectedAccountAddress });
          console.log(resultMint);
          const tokenID = resultMint.events.Transfer.returnValues.tokenId;
          setmintedTokens(
            mintedTokens.concat({ tokenID, serialNumber, zipCode })
          );
          alert("minted");
        }}
      >
        mint
      </button>
      <div>
        <h2>Recently Minted Tokens </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <table>
            <thead>
              <th>Serial Number</th>
              <th>Zip Code</th>
              <th>Token ID</th>
            </thead>
            <tbody>
              {mintedTokens.map((token) => {
                return (
                  <tr
                    style={{
                      backgroundColor: "turquoise",
                    }}
                    key={token.tokenID}
                    onClick={() => {
                      router.push(
                        `/product/${productContract.options.address}/${token.tokenID}`
                      );
                    }}
                  >
                    <td> {token.serialNumber}</td>
                    <td> {token.zipCode}</td>
                    <td> {token.tokenID}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
