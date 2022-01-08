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
  const [tokenIdTrace, setTokenIdTrace] = useState("");
  const [to, setToAdress] = useState("");
  const [tokenIdTransfer, setTokenIdTransfer] = useState("");
  const [tokenTransfer, setTokenTransfer] = useState("");
  const [tokenTrace, setTokenTrace] = useState<[string, boolean][] | null>(
    null
  );
  const [tokenIdApproveTransfer, setTokenIdApproveTransfer] = useState("");
  const [approveTransfer, setApproveTransfer] = useState("");
  const [tokenIdCancelTransfer, setTokenIdCancelTransfer] = useState("");
  const [resultCancelTransfer, setCancelTransfer] = useState("");

  const [waitingTransfer, setWaiting] = useState("");
  const [prevOwnersOfToken, setprevOwnersOfToken] = useState("");

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
        await refreshTrace();
        setWaiting(
          await productContract.methods
            .waitingtransfers(tokenID)
            .call({ from: selectedAccountAddress })
        );

        setprevOwnersOfToken(
          await productContract.methods
            .returnPrevOwnerAddressOfToken(tokenID)
            .call({ from: selectedAccountAddress })
        );
      }
    })();
  }, [web3, selectedAccountAddress, _contractAddress, tokenID]);

  const refreshTrace = async () => {
    const resultTrace = await productContract.methods
      .trace(tokenID)
      .call({ from: selectedAccountAddress });
    setTokenTrace(resultTrace);
  };
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
        <div>waiting : {waitingTransfer}</div>
        <div>prevOwnerOfToken : {prevOwnersOfToken}</div>
        <div>
          trace a token:
          {/* <pre>{JSON.stringify(tokenTrace, null, 2)}</pre> */}
          <table
            style={{
              border: "1px solid black",
            }}
          >
            <thead>
              <th
                style={{
                  border: "1px solid black",
                }}
                onClick={async () => {
                  setTokenTrace(null);
                  await refreshTrace();
                }}
              >
                🔄
              </th>
              <th
                style={{
                  border: "1px solid black",
                }}
              >
                Address
              </th>
              <th
                style={{
                  border: "1px solid black",
                }}
              >
                isVerified
              </th>
            </thead>
            <tbody>
              {tokenTrace?.map(([address, isVerified], index) => {
                return (
                  <tr key={index + address}>
                    <td
                      style={{
                        border: "1px solid black",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                      }}
                    >
                      {address}
                    </td>
                    <td
                      style={{
                        border: "1px solid black",
                      }}
                    >
                      {isVerified ? "✔️" : "❌"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {prevOwnersOfToken.toLowerCase() ==
          selectedAccountAddress.toLowerCase() &&
          waitingTransfer == "0x0000000000000000000000000000000000000000" && (
            <div>
              transfer to:{" "}
              <input
                type="text"
                value={to}
                onChange={(e) => setToAdress(e.target.value)}
              />
              {/* tokenId:{" "}
            <input
              type="text"
              value={tokenIdTransfer}
              onChange={(e) => setTokenIdTransfer(e.target.value)}
            /> */}
              <button
                onClick={async () => {
                  const r = await productContract.methods
                    .returnWaitingAddress(tokenID)
                    .call({ from: selectedAccountAddress });
                  if (
                    r == 0
                    // there is no waiting user for this token
                  ) {
                    console.log(
                      "🚀 ~ file: [tokenID].tsx ~ line 95 ~ onClick={ ~ prevOwnersOfToken",
                      prevOwnersOfToken,
                      selectedAccountAddress
                    );
                    if (
                      prevOwnersOfToken.toLowerCase() ==
                      selectedAccountAddress.toLowerCase()
                      // the last owner of this token is this person who is calling
                    ) {
                      const resultTransfer = await productContract.methods
                        .transfer(to, tokenID)
                        .send({ from: selectedAccountAddress });
                      setTokenTransfer(resultTransfer);
                    } else {
                      alert(
                        "You are not the owner of this token so you can't send this token to someone else"
                      );
                    }
                  } else {
                    alert(
                      "This token is waiting another user to approve its transfer you can't send this token to someone else"
                    );
                  }
                }}
              >
                call
              </button>
              <pre>{JSON.stringify(tokenTransfer, null, 2)}</pre>
            </div>
          )}

        {selectedAccountAddress.toLowerCase() ==
          waitingTransfer.toLowerCase() && (
          <div>
            Approve transfer :{" "}
            {/* <input
  type="text"
  value={tokenIdApproveTransfer}
  onChange={(e) => setTokenIdApproveTransfer(e.target.value)}
/> */}
            <button
              onClick={async () => {
                const a = await productContract.methods
                  .returnWaitingAddress(tokenID)
                  .call({ from: selectedAccountAddress });
                if (a.toLowerCase() == selectedAccountAddress.toLowerCase()) {
                  const resultApproveTransfer = await productContract.methods
                    .approveTransfer(tokenID)
                    .send({ from: selectedAccountAddress });
                  setApproveTransfer(resultApproveTransfer);
                } else {
                  alert(
                    "You are not the address where this token waits to be approved"
                  );
                }
              }}
            >
              call
            </button>
            <pre>{JSON.stringify(approveTransfer, null, 2)}</pre>
          </div>
        )}

        {prevOwnersOfToken.toLowerCase() ==
          selectedAccountAddress.toLowerCase() &&
          waitingTransfer != "0x0000000000000000000000000000000000000000" && (
            <div>
              Cancel transfer :{" "}
              <button
                onClick={async () => {
                  const b = await productContract.methods
                    .returnWaitingAddress(tokenID)
                    .call({ from: selectedAccountAddress });
                  if (b != 0) {
                    const prevOwnersOfToken = await productContract.methods
                      .returnPrevOwnerAddressOfToken(tokenID)
                      .call({ from: selectedAccountAddress });

                    if (
                      prevOwnersOfToken.toLowerCase() ==
                      selectedAccountAddress.toLowerCase()
                    ) {
                      const resultCancel = await productContract.methods
                        .cancelTransfer(tokenID)
                        .send({ from: selectedAccountAddress });
                      setCancelTransfer(resultCancel);
                      alert(approveTransfer);
                    } else {
                      alert(
                        "You are not the owner of this token so you can't cancel the transfer"
                      );
                    }
                  } else {
                    alert(
                      "This token has not been sent to an address for transfer previously so there is nothing to cancel"
                    );
                  }
                }}
              >
                call
              </button>
              <pre>{JSON.stringify(resultCancelTransfer, null, 2)}</pre>
            </div>
          )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
