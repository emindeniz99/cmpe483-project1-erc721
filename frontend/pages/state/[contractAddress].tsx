import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { compiledStateContract, useWeb3 } from "../../components/Web3js";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const { contractAddress: _contractAddress } = router.query;

  const { web3, selectedAccountAddress, stateContract } = useWeb3();

  const [contractOwner, setcontractOwner] = useState("");
  const [contractAddress, setcontractAddress] = useState(_contractAddress);
  const [queryVerifiedAddress, setqueryVerifiedAddress] = useState("");
  const [verifiedAddress, setverifiedAddress] = useState("");
  const [verifiedResult, setverifiedResult] = useState("");

  useEffect(() => {
    (async () => {
      if (_contractAddress) {
        stateContract.options.address = _contractAddress as any;
        setcontractAddress(_contractAddress);

        setcontractOwner(
          await stateContract.methods
            .state()
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
        <h1>State Contract</h1>

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
        <div>
          <input
            type="text"
            value={queryVerifiedAddress}
            onChange={(e) => setqueryVerifiedAddress(e.target.value)}
            placeholder="address"
          />
          <button
            onClick={async () => {
              alert(
                (await stateContract.methods
                  .queryVerified(queryVerifiedAddress)
                  .call({ from: selectedAccountAddress }))
                  ? "Verified"
                  : "Not verified"
              );
            }}
          >
            query
          </button>
        </div>

        <div>
          <input
            type="text"
            value={verifiedAddress}
            onChange={(e) => setverifiedAddress(e.target.value)}
            placeholder="address"
          />
          <button
            onClick={async () => {
              if (
                contractOwner.toLowerCase() ===
                selectedAccountAddress.toLowerCase()
              ) {
                if (
                  !(await stateContract.methods
                    .queryVerified(verifiedAddress)
                    .call({ from: selectedAccountAddress }))
                ) {
                  const result = await stateContract.methods
                    .verify(verifiedAddress)
                    .send({ from: selectedAccountAddress });
                  setverifiedResult(result);
                  alert("verified");
                } else {
                  alert("this account is already verified");
                }
              } else {
                alert("you are not the owner of the state contract");
              }
            }}
          >
            verify
          </button>
          {/* <pre>{JSON.stringify(verifiedResult, null, 2)}</pre> */}
        </div>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
