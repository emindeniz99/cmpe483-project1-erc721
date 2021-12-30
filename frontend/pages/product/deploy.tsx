import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { compiledProductContract, useWeb3 } from "../../components/Web3js";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const { web3, selectedAccountAddress, productContract } = useWeb3();

  const [address, setaddress] = useState("");
  const [stateaddress, setstateaddress] = useState("");

  useEffect(() => {
    (async () => {})();
  }, [web3, selectedAccountAddress]);
  return (
    <div className={styles.container}>
      <Head>
        <title>State - Deploy</title>
      </Head>

      <main className={styles.main}>
        <div>
          state add:{" "}
          <input
            type="text"
            value={stateaddress}
            onChange={(e) => {
              setstateaddress(e.target.value);
            }}
          />
        </div>

        {address && (
          <div>
            Deployed Address:
            <a
              style={{ color: "red" }}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/product/${address}`);
              }}
              href={`/product/${address}`}
            >
              {" "}
              {address}{" "}
            </a>
          </div>
        )}
        <button
          onClick={async () => {
            console.log(
              await productContract
                .deploy({
                  data: compiledProductContract.bytecode,
                  arguments: [stateaddress],
                })
                .estimateGas()
            );
            const aaaa = await productContract
              .deploy({
                data: compiledProductContract.bytecode,
                arguments: [stateaddress],
              })
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
          deploy a new contract
        </button>
        <br />
        <h3>or</h3>
        <GoToContract />
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};
const GoToContract = () => {
  const [contractAddress, setContractAddress] = useState("");
  const router = useRouter();

  return (
    <div>
      go to deployed contract:{" "}
      <input
        type="text"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        placeholder="contract address"
      />
      <button
        onClick={async () => {
          router.push(`/product/${contractAddress}`);
        }}
      >
        go
      </button>
    </div>
  );
};
export default Home;
