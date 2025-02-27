// This file was autogenerated by hardhat-viem, do not edit it.
// prettier-ignore
// tslint:disable
// eslint-disable

import "hardhat/types/artifacts";
import type { GetContractReturnType } from "@nomicfoundation/hardhat-viem/types";

import { ERC1155Supply$Type } from "./ERC1155Supply";

declare module "hardhat/types/artifacts" {
  interface ArtifactsMap {
    ["ERC1155Supply"]: ERC1155Supply$Type;
    ["@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol:ERC1155Supply"]: ERC1155Supply$Type;
  }

  interface ContractTypesMap {
    ["ERC1155Supply"]: GetContractReturnType<ERC1155Supply$Type["abi"]>;
    ["@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol:ERC1155Supply"]: GetContractReturnType<ERC1155Supply$Type["abi"]>;
  }
}
