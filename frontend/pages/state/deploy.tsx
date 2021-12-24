import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { compiledStateContract, useWeb3 } from "../../components/Web3js";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const { web3, selectedAccountAddress, stateContract } = useWeb3();

  const [address, setaddress] = useState("");

  useEffect(() => {
    (async () => {})();
  }, [web3, selectedAccountAddress]);
  return (
    <div className={styles.container}>
      <Head>
        <title>State - Deploy</title>
      </Head>

      <main className={styles.main}>
        {address && (
          <div>
            Deployed Address:
            <a
              style={{ color: "red" }}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/state/${address}`);
              }}
              href={`/state/${address}`}
            >
              {" "}
              {address}{" "}
            </a>
          </div>
        )}
        <button
          onClick={async () => {
            console.log(
              await stateContract
                .deploy({ data: compiledStateContract.bytecode })
                .estimateGas()
            );
            const aaaa = await stateContract
              .deploy({ data: compiledStateContract.bytecode })
              .send({
                from: selectedAccountAddress,
                // gas: await stateContract
                //   .deploy({ data: State.bytecode })
                //   .estimateGas(),
                // gasPrice: "30000000000000",
              });
            console.log(aaaa);
            console.log(aaaa.options.address);
            setaddress(aaaa.options.address);
          }}
        >
          deploy
        </button>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
