import axios from "axios";
//import React, { useState, useEffect } from "react";
import { signAndConfirmTransactionFe } from "../pages/utilityfunc";
import {maxSup,roy} from "../pages/index.js";
import { PublicKey } from "@solana/web3.js";

const xApiKey = "zTiZ_N4qry8ngA3u";
let attrib = [{"trait_type": "speed", "value": 100},
{"trait_type": "aggression", "value": "crazy"},
{"trait_type": "energy", "value": "very high"}];

const Create = async (publicKey) => {
	console.log('entro');
	const callback = (signature,result) => {
		console.log("Signature ",signature);
		console.log("result ",result);
	}

	const mintNow = async (e) => {

		//e.preventDefault();
		let formData = new FormData();

		console.log(publicKey);
		console.log("Al chile ando bien descentralizado",typeof publicKey);

		formData.append("network", "devnet");
		formData.append("wallet", publicKey);
		formData.append("name", "ticket");
		formData.append("symbol", "fkt");
		formData.append("description", "Ticket valido");
		//formData.append("attributes", JSON.stringify(attrib));
		//formData.append("external_url", "https://shyft.to")
		formData.append("receiver", publicKey)


		//blob img 
		const imageUrl = "https://asset.cloudinary.com/dpwnhtwpm/87d315380048a24555076da1520b4bed"
		const imageFetchResponse = await fetch(imageUrl)
		const imgBlob = await imageFetchResponse.blob()
		console.log("blob", imgBlob)
		formData.append("file", imgBlob)
		

		const shyftDetachResponse = await axios.post("https://api.shyft.to/sol/v1/nft/create_detach", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				"x-api-key": xApiKey,
			},
		})

		console.log("shyftDetachResponse => ", shyftDetachResponse)

		if(shyftDetachResponse.data.success === true) {
			try {
				const transaction = shyftDetachResponse.data.result.encoded_transaction;
				//setSaveMinted(shyftDetachResponse.data.result.mint);
				const ret_result = await signAndConfirmTransactionFe("devnet",transaction,callback);
        		console.log(ret_result);
				//setDispResp(shyftDetachResponse.data);



			} catch (error) {
				console.log("error", error)
			}
		}

	}
	mintNow();
}

export default Create