import { Injectable } from '@angular/core';
import { Subject} from 'rxjs';

// Web3 Stuff | Dependencias de Web3

import Web3 from 'web3';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider"; // this profile wallet handler
import { provider } from 'web3-core';
import {HttpClient} from "@angular/common/http";
import axios from "axios";


@Injectable({
  providedIn: 'root'
})

export class Web3Service {

  public accountsObservable = new Subject<string[]>();
  web3Modal;
  web3js:  any;
  provider: provider | undefined;
  accounts: string[] | undefined;
  balance: string | undefined;

  constructor(
  ) {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required | here whe import the package necessary to support wallets|| aqui importamos el paquete que nos ayudara a usar soportar distintas wallets
        options: {
          //infuraId: 'env', // required change this with your own infura id | cambia esto con tu apikey de infura
          rpc:{
            56:'https://bsc-dataseed.binance.org/',
            1337:'HTTP://127.0.0.1:7545'
          },
          chainId:1337,

          description: 'Scan the qr code and sign in', // You can change the desciption | Puedes camnbiar los textos descriptivos en la seccion description
 /*         qrcodeModalOptions: {
            mobileLinks: [
              'rainbow',
              'metamask',
              'argent',
              'trust',
              'imtoken',
              'pillar'
            ]
          }*/
        }
      },
      injected: {
        display: {
          logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
          name: 'metamask',
          description: "Connect with the provider in your Browser"
        },
        package: null
      },
    };

    this.web3Modal = new Web3Modal({
      network: "mainnet", // optional change this with the net you want to use like rinkeby etc | puedes cambiar a una red de pruebas o etc
      cacheProvider: true, // optional
      providerOptions, // required
      theme: {
        background: "rgb(39, 49, 56)",
        main: "rgb(199, 199, 199)",
        secondary: "rgb(136, 136, 136)",
        border: "rgba(195, 195, 195, 0.14)",
        hover: "rgb(16, 26, 32)"
      }
    });
  }


  async connectAccount() {
    this.provider = await this.web3Modal.connect(); // set provider
    if (this.provider) {
      this.web3js = new Web3(this.provider);
    } // create web3 instance
    this.accounts = await this.web3js.eth.getAccounts();
    return this.accounts;
  }

  async disconnectAccount(){
    if(this.provider)
    this.provider=null
    await this.web3Modal.clearCachedProvider()

  }

  async getChainId(){
    if(this.provider){
      return this.web3js.eth.getChainId()
    }
  }

  async accountInfo(account: any[]){
    const initialvalue = await this.web3js.eth.getBalance(account);
    this.balance = this.web3js.utils.fromWei(initialvalue , 'ether');
    return this.balance;
  }

  async transfer(address:string,amount:string){

    const price=  Web3.utils.toWei(amount,'ether')
    console.log('Start TX',price)

    if(this.accounts) {
      console.log(this.accounts[0])
      const nonce = await this.web3js.eth.getTransactionCount(this.accounts[0], 'latest');
      console.log(nonce)
      const result= await this.web3js.eth.sendTransaction({
        from: this.accounts[0] as string,
        to: address,
        value: price,
        gas: '25000',
        nonce:nonce,
      })
      console.log(result)
      return result.transactionHash
    }

  }

  async getBalance(address:string){
    const balance=await this.web3js.eth.getBalance(address)
    return this.web3js.utils.fromWei(balance,'ether')
  }


   async getContractSymbol(contractAddress: string) {
     const abi = await this.getContractAbi(contractAddress)
     const contract=new this.web3js.Contract(abi,contractAddress,)
     contract.setProvider(this.provider)
     return contract.methods.symbol().call()
   }

   async getContractAbi(contractAddress: string) {
     const result = await axios.get(`https://api-testnet.bscscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=6969183NICVIJQ5NVHR65KZ4YPTIDMTK8H`)
     if(result.status==200)
       return result.data.result
     return null
   }

}
