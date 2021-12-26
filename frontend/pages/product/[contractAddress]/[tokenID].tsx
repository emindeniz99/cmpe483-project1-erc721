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
  const [tokenTrace, setTokenTrace] = useState("");
  const [tokenIdApproveTransfer, setTokenIdApproveTransfer] = useState("");
  const [approveTransfer, setApproveTransfer] = useState("");
  const [tokenIdCancelTransfer, setTokenIdCancelTransfer] = useState("");
  const [resultCancelTransfer, setCancelTransfer] = useState("");
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
          trace a token (type tokenId):{" "}
          <input
            type="text"
            value={tokenIdTrace}
            onChange={(e) => setTokenIdTrace(e.target.value)}
          />
          <button
            onClick={async () => {
                const resultTrace=await productContract.methods
                  .trace(tokenIdTrace)
                  .call({ from: selectedAccountAddress })
                setTokenTrace(resultTrace);
            }
        }
          >
            call
          </button>
          <pre>{JSON.stringify(tokenTrace, null, 2)}</pre>
        </div>

        <div>
          transfer to:{" "}
          <input
            type="text"
            value={to}
            onChange={(e) => setToAdress(e.target.value)}
          />
          tokenId:{" "}
          <input
            type="text"
            value={tokenIdTransfer}
            onChange={(e) => setTokenIdTransfer(e.target.value)}
          />
          <button
            onClick={async () => {
              const r=await productContract.methods.returnWaitingAddress(tokenIdTransfer).call({from:selectedAccountAddress});
              if (r==0
              // there is no waiting user for this token
                ) {
                  const prevOwnersOfToken=await productContract.methods.returnPrevOwnerAddressOfToken(tokenIdTransfer).call({from:selectedAccountAddress});
                  if(prevOwnersOfToken==selectedAccountAddress
                    // the last owner of this token is this person who is calling
                  ){
                    const resultTransfer = await productContract.methods
                  .transfer(to,tokenIdTransfer)
                  .send({ from: selectedAccountAddress });
                setTokenTransfer(resultTransfer);
                alert(resultTransfer);
                  }else{
                    alert("You are not the owner of this token so you can't send this token to someone else")
                  }
                
              } else {
                
                alert("This token is waiting another user to approve its transfer you can't send this token to someone else");
              }
            }}
          >
            call
          </button>
          <pre>{JSON.stringify(tokenTransfer, null, 2)}</pre>
        </div>

        <div>
          Approve transfer (type tokenId): {" "}
          <input type="text"
            value={tokenIdApproveTransfer}
            onChange={(e) => setTokenIdApproveTransfer(e.target.value)}
            />
          <button
          onClick={async () => {
            const a= await productContract.methods.returnWaitingAddress(tokenIdApproveTransfer).call({ from: selectedAccountAddress });
            if(a==selectedAccountAddress){
              const resultApproveTransfer=await productContract.methods.approveTransfer(tokenIdApproveTransfer).send({ from: selectedAccountAddress });
              setApproveTransfer(resultApproveTransfer);
              alert(approveTransfer);
            }else{
              alert("You are not the address where this token waits to be approved");
            }
          }}
          >
          
    
          call
          </button>
          <pre>{JSON.stringify(approveTransfer, null, 2)}</pre>
        </div>
        
        <div>
          Cancel transfer (type tokenId): {" "}
          <input type="text"
            value={tokenIdCancelTransfer}
            onChange={(e) => setTokenIdCancelTransfer(e.target.value)}
            />
          <button
          onClick={async () => {
            const b =await productContract.methods.returnWaitingAddress(tokenIdCancelTransfer).call({from:selectedAccountAddress});
            if(b!=0){
              const prevOwnersOfToken=await productContract.methods.returnPrevOwnerAddressOfToken(tokenIdCancelTransfer).call({from:selectedAccountAddress});
                  
              if(prevOwnersOfToken==selectedAccountAddress){
                const resultCancel=await productContract.methods.canvcelTransfer(tokenIdCancelTransfer).send({ from: selectedAccountAddress });
              setCancelTransfer(resultCancel);
              alert(approveTransfer);
              }else{
                alert("You are not the owner of this token so you can't cancel the transfer");
              }
              
            }else{
              alert("This token has not been sent to an address for transfer previously so there is nothing to cancel");
            }
          }}
          >
          
    
          call
          </button>
          <pre>{JSON.stringify(resultCancelTransfer, null, 2)}</pre>
        </div>

      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
};

export default Home;
