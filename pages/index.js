import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  SendTransactionError,
}from "@solana/web3.js";
import { useStorageUpload } from "@thirdweb-dev/react";
import axios from "axios";
import Create from "@/components/createNFT.js"

const SOLANA_NETWORK="devnet";

const Home=()=>{
  const [publicKey, setPublicKey] = useState(null);
  const router=useRouter();
  const [balance, setBalance] = useState(0);
  const [receiver, setReceiver] = useState(null);
  const [amount, setAmount] = useState(null);
  const [attr, setAttr] = useState(JSON.stringify([{"trait_type": "edification","value": "100"}]));
  const [maxSup, setMaxSup] = useState(0);
	const [roy, setRoy] = useState(99);
  const [minted,setMinted] = useState();
	const [saveMinted,setSaveMinted] = useState();
	const [errorRoy, setErrorRoy] = useState();

	const [status, setStatus] = useState("Awaiting Upload");
	const [dispResponse, setDispResp] = useState("");

	const [connStatus, setConnStatus] = useState(true);


  useEffect(()=>{
    let Key=window.localStorage.getItem("publicKey");
    setPublicKey(Key);
    if (Key) getBalances(Key);
  },[]);

  const handleSubmit = async () => {
    sendTransaction();
  };

  const signIn = async () => {
    const provider = window?.phantom?.solana;
    const { solana } = window;

    if (!provider?.isPhantom || !solana.isPhantom) {
        toast.error("Phantom no esta instalado");
        setTimeout(() => {
            window.open("https://phantom.app/", "_blank");
        }, 2000);
        return;
    }
    let phantom;
    if (provider?.isPhantom) phantom = provider;

    const { publicKey } = await phantom.connect(); 
    console.log("publicKey", publicKey.toString()); 
    setPublicKey(publicKey.toString());
    window.localStorage.setItem("publicKey", publicKey.toString());

    toast.success("Wallet conectada");

    getBalances(publicKey);

  };

  const signOut = async ()=>{
    if(window){
      const{solana}=window;
      window.localStorage.removeItem("publicKey");
      setPublicKey(null);
      solana.disconnect();
      router.reload(window?.location?.pathname);
    }
  };

  const getBalances = async(publicKey)=>{
    try{
      const connection=new Connection(
        clusterApiUrl(SOLANA_NETWORK),
        "confirmed"
      );

      const balance=await connection.getBalance(
        new PublicKey(publicKey)
      );

      const balancenew=balance/LAMPORTS_PER_SOL;
      setBalance(balancenew);
    }catch(error){
      console.error("ERROR OBTENIENDO BALANCE",error);
      toast.error("Algo salió mal obteniendo el balance");
    }
  };

  const sendTransaction = async () => {
    try {
      getBalances(publicKey);
      if (balance < 0.0001) {
        toast.error("No tienes suficiente balance");
        return;
      }

      const provider = window?.phantom?.solana;
      const connection = new Connection(
        clusterApiUrl(SOLANA_NETWORK),
        "confirmed"
      );
      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey("Hk6Z6rHhCNWLPotAguuD9udBYhuaBbrtJ8qmEqpoiuDR");
  
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const transactionsignature = await provider.signTransaction(
        transaction
      );

      const txid = await connection.sendRawTransaction(
        transactionsignature.serialize()
      );

      const confirmation = await connection.confirmTransaction(txid, {
        commitment: "singleGossip",
      });

      const { slot } = confirmation.value;

      toast.success("Transaccion enviada con exito :D ");

      getBalances(publicKey);
      setAmount(null);
      setReceiver(null);

    } catch (error) {
      console.error("ERROR SEND TRANSACTION", error);
      toast.error("Error al enviar la transaccion");
    }
  };

  return(
    <>
      <div className="flex flex-col w-screen h-screen bg-black">
        <div className="flex flex-col py-1">
          {publicKey ? (
            <div className="flex flex-col py-1 items-center">
              <h1 className="text-2x1 text-gray-200">
                Tu numero de wallet es {publicKey} y tienes {balance} SOL
              </h1>
              <button type="submit" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-400" 
              onClick={()=>{
                handleSubmit();
                Create(publicKey);
              }}>
                Pagar
              </button>
              <button type="submit" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-400"
              onClick={()=>{
                signOut();
              }}
            >
              Desconecta tu wallet
            </button>
            </div>
          ):(
          <div className="flex flex-col py-1 items-center">
            <button type="submit" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-400" 
            onClick={()=>{
              console.log("Me presionaron");
              signIn();
              }}>
              Conecta tu wallet
            </button>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
export default Home;