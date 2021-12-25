import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { compiledStateContract, useWeb3 } from "../../../components/Web3js";
import styles from "../../../styles/Home.module.css";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const { contractAddress: _contractAddress, tokenID } = router.query;

  const { web3, selectedAccountAddress, productContract } = useWeb3();

  const [contractOwner, setcontractOwner] = useState("");
  const [contractAddress, setcontractAddress] = useState(_contractAddress);
  const [queryVerifiedAddress, setqueryVerifiedAddress] = useState("");
  const [verifiedAddress, setverifiedAddress] = useState("");
  const [verifiedResult, setverifiedResult] = useState("");

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
      }
    })();
  }, [web3, selectedAccountAddress, _contractAddress]);
  return (
    <div className={styles.container}>
      <Head>
        <title>State - Deploy</title>
      </Head>

      <main className={styles.main}>
        <h1>Product Contract - Token Page</h1>
        <div>tokenid: {tokenID}</div>
        {contractAddress && (
          <div>
            Deployed Address:
            {contractAddress}
          </div>
        )}
        {contractOwner && (
          <div>
            contractOwner:
            {contractOwner}
          </div>
        )}
        <div>
          (TODO CHANGE) queryVerified:{" "}
          <input
            type="text"
            value={queryVerifiedAddress}
            onChange={(e) => setqueryVerifiedAddress(e.target.value)}
          />
          <button
            onClick={async () => {
              alert(
                await productContract.methods
                  .queryVerified(queryVerifiedAddress)
                  .call({ from: selectedAccountAddress })
              );
            }}
          >
            call
          </button>
        </div>

        <div>
          (TODO CHANGE) verify:{" "}
          <input
            type="text"
            value={verifiedAddress}
            onChange={(e) => setverifiedAddress(e.target.value)}
          />
          <button
            onClick={async () => {
              if (contractOwner === selectedAccountAddress) {
                const result = await productContract.methods
                  .verify("0xa...")
                  .send({ from: selectedAccountAddress });
                setverifiedResult(result);
              } else {
                alert("you are not the owner of the state contract");
              }
            }}
          >
            call
          </button>
          <pre>{JSON.stringify(verifiedResult, null, 2)}</pre>
        </div>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
