import { Component } from '@angular/core';
import {ContractService} from "./service/contract.service";
import {Web3Service} from "./service/web3.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web3-modal-angular';
  address=''
  balance='000'
  chainId=''
  toAddress='0xd9f213668E5bF179BDdA444c2a8202ed60Ca1db2'
  amount='0.015'
  results='*******'
  abi=''
  constructor(
    private readonly contractService:ContractService,
    private readonly web3Service:Web3Service
  ) {
  }

  async connect(){
    const result=await this.web3Service.connectAccount()
    if(result){
      this.address=result[0]
      this.chainId=await this.web3Service.getChainId()

      this.balance=await this.web3Service.getBalance(this.address)
      console.log(this.balance)
    }
  }

  async disconnect(){
    await this.web3Service.disconnectAccount()
  }

  async sendTx(){
    console.log(this.toAddress,this.amount)

    if(this.toAddress && this.amount){
      console.log(this.toAddress,this.amount)
      this.results=await this.web3Service.transfer(this.toAddress,this.amount)
    }
  }

  async getAbi(){
/*    this.web3Service.getContractAbi('').subscribe(
      (res: any) => {
        this.abi = res.result;
      }
    )*/

    this.abi=await this.web3Service.getContractSymbol('0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56')
  }
}
