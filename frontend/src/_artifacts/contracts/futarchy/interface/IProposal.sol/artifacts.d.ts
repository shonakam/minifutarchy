// This file was autogenerated by hardhat-viem, do not edit it.
// prettier-ignore
// tslint:disable
// eslint-disable

import "hardhat/types/artifacts";
import type { GetContractReturnType } from "@nomicfoundation/hardhat-viem/types";

import { IProposal$Type } from "./IProposal";

declare module "hardhat/types/artifacts" {
  interface ArtifactsMap {
    ["IProposal"]: IProposal$Type;
    ["contracts/futarchy/interface/IProposal.sol:IProposal"]: IProposal$Type;
  }

  interface ContractTypesMap {
    ["IProposal"]: GetContractReturnType<IProposal$Type["abi"]>;
    ["contracts/futarchy/interface/IProposal.sol:IProposal"]: GetContractReturnType<IProposal$Type["abi"]>;
  }
}
