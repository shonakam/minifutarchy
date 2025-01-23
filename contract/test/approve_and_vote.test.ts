import { expect } from "chai";
import hre, { viem } from "hardhat";
import { 
  createPublicClient, createWalletClient, 
  TransactionReceipt, decodeEventLog, getContract, 
  custom, http,
  keccak256, stringToBytes
  } from "viem";
import { hardhat, taraxa } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

import abiProposal from "../artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json";
import abiExchange from "../artifacts/contracts/futarchy/Exchange.sol/Exchange.json";
import abiFactory from "../artifacts/contracts/futarchy/factory/ProposalFactory.sol/ProposalFactory.json";
import abiCollateralMock from "../artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json";
import { writeContract } from "viem/_types/actions/wallet/writeContract";
import { deploy, setupInstance, toWei, fromWei } from "./setup.helper";

/**
 * ## テストシナリオ ##
 *
 * 1. Proposal の作成
 *    - Factory を通じて Proposal を作成。
 *    - Proposal が正しく初期化されていることを確認。
 *
 * 2. 流動性提供
 *    - `addLiquidity` を通じて流動性を追加。
 *    - リザーブ量と LP トークンが正しく更新されていることを確認。
 *
 * 3. 投票
 *    - `vote` 関数を通じて Yes または No に投票。
 *    - リザーブ量とトークン供給量が正しく更新されていることを確認。
 *
 * 4. スワップ
 *    - CPMM ロジックを基に、Yes ↔ No トークンをスワップ。
 *    - スワップ後のリザーブ量が正しく反映されていることを確認。
 *
 * 5. 流動性削除
 *    - `removeLiquidity` 関数を通じて流動性を削除。
 *    - リザーブ量が正しく減少し、ユーザーがトークンを受け取っていることを確認。
 */
describe("Exchange Integration Test", function () {
  let setupData: Awaited<ReturnType<typeof setupInstance>>;
  beforeEach(async function () { setupData = await setupInstance() });

  it("1. safeApproveの検証", async () => {
    const { publicClient, x, y, z, collateral, exchange, proposalAddress } = setupData;
    let txHash: `0x${string}`, receipt: TransactionReceipt, reserves

    await x.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(200))],
    });

    await x.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(100)), true],
    });

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getUserBalances", args: [x.account.address]
    }) as unknown as bigint[]
    // console.log("x: ", reserves);

    // reserves = await publicClient.readContract({
    //   address: proposalAddress, abi: abiProposal.abi,
    //   functionName: "getMarketReserves", args: []
    // }) as unknown as bigint[]
    // for (const v of reserves) console.log(fromWei(Number(v)))

    // reserves = await publicClient.readContract({
    //   address: proposalAddress, abi: abiProposal.abi,
    //   functionName: "getMarketCollateralBalance", args: []
    // }) as unknown as bigint[]
    // console.log(reserves)



    await y.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(200))],
    });

    await y.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(100)), true],
    });

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getUserBalances", args: [y.account.address]
    }) as unknown as bigint[]
    // console.log("y: ", reserves);

    // reserves = await publicClient.readContract({
    //   address: proposalAddress, abi: abiProposal.abi,
    //   functionName: "getMarketReserves", args: []
    // }) as unknown as bigint[]
    // for (const v of reserves) console.log(fromWei(Number(v)))

    // reserves = await publicClient.readContract({
    //   address: proposalAddress, abi: abiProposal.abi,
    //   functionName: "getMarketCollateralBalance", args: []
    // }) as unknown as bigint[]
    // console.log(reserves)



    await z.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(200))],
    });

    await z.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(100)), false],
    });

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getUserBalances", args: [z.account.address]
    }) as unknown as bigint[]
    // console.log("z: ", reserves);

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getMarketReserves", args: []
    }) as unknown as bigint[]
    // for (const v of reserves) console.log(fromWei(Number(v)))

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getMarketCollateralBalance", args: []
    }) as unknown as bigint[]
    // console.log(reserves)
  });

  it("2. 期日前償還機能の検証[YES -> redeem]", async () => {
    const { publicClient, x, y, z, collateral, exchange, proposalAddress } = setupData;
    let txHash: `0x${string}`, receipt: TransactionReceipt, reserves

    await x.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(200))],
    });

    await x.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(100)), true],
    });

    await x.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "redeem", args: [proposalAddress, BigInt(toWei(100)), true],
    });


    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getUserBalances", args: [x.account.address]
    }) as unknown as bigint[]
    // console.log("x: ", reserves);

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getMarketReserves", args: []
    }) as unknown as bigint[]
    // for (const v of reserves) console.log(fromWei(Number(v)))
  });

  it("3. 期日前償還機能の検証[NO -> redeem]", async () => {
    const { publicClient, x, y, z, collateral, exchange, proposalAddress } = setupData;
    let txHash: `0x${string}`, receipt: TransactionReceipt, reserves

    await x.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(200))],
    });

    await x.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(100)), false],
    });

    await x.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "redeem", args: [proposalAddress, BigInt(toWei(100)), false],
    });


    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getUserBalances", args: [x.account.address]
    }) as unknown as bigint[]
    // console.log("x: ", reserves);

    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getMarketReserves", args: []
    }) as unknown as bigint[]
    // for (const v of reserves) console.log(fromWei(Number(v)))
  });

  it("4. 投票圧力の検証", async () => {
    const { publicClient, x, y, z, collateral, exchange, proposalAddress } = setupData;
    let txHash: `0x${string}`, receipt: TransactionReceipt, reserves, votePressure

    await x.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(200))],
    });

    await x.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(100)), true],
    });
    reserves = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getMarketReserves", args: []
    }) as unknown as bigint[]
    for (const v of reserves) console.log(fromWei(Number(v)))

    votePressure = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getVotePressure", args: []
    }) as unknown as bigint
    let votePressureNumber = Number(votePressure) / 1e18
    console.log("vote pressure: ", votePressureNumber)
  });
});
