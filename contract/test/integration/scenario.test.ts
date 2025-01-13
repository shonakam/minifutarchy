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

import abiProposal from "../../artifacts/contracts/futarchy/target/Proposal.sol/Proposal.json";
import abiExchange from "../../artifacts/contracts/futarchy/Exchange.sol/Exchange.json";
import abiFactory from "../../artifacts/contracts/futarchy/factory/ProposalFactory.sol/ProposalFactory.json";
import abiCollateralMock from "../../artifacts/contracts/futarchy/CollateralMock.sol/CollateralMock.json";
import { writeContract } from "viem/_types/actions/wallet/writeContract";

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

function toWei(input: number) { return input * 10**18 }
function fromWei(input: number) { return input / 10**18 }

describe("Futarchy Integration Test with Viem", function () {
	const deploy = async () => {
    const publicClient = await hre.viem.getPublicClient()
    const [from, to] = await hre.viem.getWalletClients()

    const collateral = await hre.viem.deployContract("CollateralMock", [BigInt(toWei(4050))]);
		const target = await hre.viem.deployContract("Proposal", []);
		const exchange = await hre.viem.deployContract("Exchange", []);
		const factory = await hre.viem.deployContract("ProposalFactory", [target.address, exchange.address]);

		return { 
      publicClient, from, to, 
      collateral, target, exchange, factory 
    };
	}

  it("1. Proposal の作成", async () => {
    const { publicClient, from, collateral, target, exchange, factory } = await loadFixture(deploy);
    let txHash: `0x${string}`, receipt: TransactionReceipt
    
    // コードを確認
    const factoryCode = await publicClient.getCode({ address: factory.address });
    const targetCode = await publicClient.getCode({ address: target.address });
    const collateralCode = await publicClient.getCode({ address: collateral.address });
    const exchangeCode = await publicClient.getCode({ address: exchange.address });
    expect(factoryCode).to.not.equal("0x");
    expect(targetCode).to.not.equal("0x");
    expect(collateralCode).to.not.equal("0x");
    expect(exchangeCode).to.not.equal("0x");

    // Proposal を作成
    const setDescription = "Test Proposal", setDuration = BigInt(7 * 24 * 60 * 60);
    expect(await factory.read.hello()).to.eq("hello");
    txHash = await factory.write.createProposal([setDescription, setDuration, collateral.address]);
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success')
    
    // Recipt から Event を取得
    const eventSignature = "ProposalCreated(uint256,address,address)";
    const eventHash = keccak256(stringToBytes(eventSignature));
    // console.log("Event Signature Hash:", eventHash);
    const eventLog = receipt.logs.find((log) => log.topics[0] === eventHash);
    type ProposalCreatedEventArgs = { proposal: string; collateralToken: string; proposalId: bigint;};
    const decodedEvent = decodeEventLog({
      abi: abiFactory.abi,
      eventName: "ProposalCreated",
      data: eventLog?.data,
      topics: eventLog?.topics || [],
    }) as unknown as { args: ProposalCreatedEventArgs };
    // console.log("Decoded Event:", decodedEvent);
    expect(decodedEvent.args.proposalId).to.deep.equal(BigInt(0));
    expect(decodedEvent.args.proposal).to.deep.equal(await factory.read.getProposal([BigInt(0)]));
    expect(decodedEvent.args.collateralToken.toLowerCase()).to.deep.equal(collateral.address.toLowerCase());

    // Proposal Instance を 検証
    const proposer = await publicClient.readContract({
      address: decodedEvent.args.proposal as `0x${string}`,
      abi: target.abi, functionName: 'proposer', args: []
    })
    const description = await publicClient.readContract({
      address: decodedEvent.args.proposal as `0x${string}`,
      abi: target.abi, functionName: 'description', args: []
    })
    const duration = await publicClient.readContract({
      address: decodedEvent.args.proposal as `0x${string}`,
      abi: target.abi, functionName: 'duration', args: []
    })
    const exchangeAddress = await publicClient.readContract({
      address: decodedEvent.args.proposal as `0x${string}`,
      abi: target.abi, functionName: 'exchange', args: []
    })
    expect(proposer.toLowerCase()).to.eq(from.account.address);
    expect(description).to.eq(setDescription);
    expect(duration).to.eq(setDuration);
    expect(exchangeAddress.toLowerCase()).to.eq(exchange.address);
  });

  it("2. ProposalInstance へ初期流動性提供", async () => {
    const { publicClient, from, collateral, factory } = await loadFixture(deploy);
    let txHash: `0x${string}`, receipt: TransactionReceipt
  
    /* <=== SETUP ===> */
    const setDescription = "Test Proposal", setDuration = BigInt(7 * 24 * 60 * 60);
    txHash = await factory.write.createProposal([setDescription, setDuration, collateral.address]);
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success')
    const eventSignature = "ProposalCreated(uint256,address,address)";
    const eventHash = keccak256(stringToBytes(eventSignature));
    const eventLog = receipt.logs.find((log) => log.topics[0] === eventHash);
    type ProposalCreatedEventArgs = { proposal: string; collateralToken: string; proposalId: bigint;};
    const decodedEvent = decodeEventLog({
      abi: abiFactory.abi,
      eventName: "ProposalCreated",
      data: eventLog?.data,
      topics: eventLog?.topics || [],
    }) as unknown as { args: ProposalCreatedEventArgs };

    txHash = await from.writeContract({
      address: collateral.address,
      abi: abiCollateralMock.abi,
      functionName: "approve",
      args: [decodedEvent.args.proposal as `0x${string}`, BigInt(4000)],
    })
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success')
    const allowedAmount = await publicClient.readContract({
      address: collateral.address as `0x${string}`,
      abi: abiCollateralMock.abi, functionName: "allowance", args: [from.account.address, decodedEvent.args.proposal]
    })
    expect(allowedAmount).to.eq(BigInt(4000))
    /* <=== START ===> */
    // 流動性を提供
    txHash = await from.writeContract({
      address: decodedEvent.args.proposal as `0x${string}`,
      abi: abiProposal.abi,
      functionName: "initializeLiquidity",
      args: [BigInt(1000),BigInt(1000)]
    })
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success')
    
    // 提供後のリザーブ量を検証
    const reserves = await publicClient.readContract({
      address: decodedEvent.args.proposal as `0x${string}`,
      abi: abiProposal.abi,
      functionName: "getMarketReserves",
      args: [],
    });
    expect(reserves).to.deep.equal([BigInt(1000), BigInt(1000)]);
  });

  it ("3. ProposalInstance へ投票", async () => {
    const { publicClient, from, collateral, factory, exchange } = await loadFixture(deploy);
    let txHash: `0x${string}`, receipt: TransactionReceipt;

    /* <=== SETUP ===> */
    const setDescription = "Test Proposal", setDuration = BigInt(7 * 24 * 60 * 60);
    await factory.write.createProposal([setDescription, setDuration, collateral.address]);
    const proposalAddress = "0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81"
    await from.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [proposalAddress, BigInt(toWei(4000))]
    })
    await from.writeContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "initializeLiquidity", args: [BigInt(toWei(2000)),BigInt(toWei(2000))]
    })
    
    /* <=== START ===> */
    await from.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(50))]
    })
    txHash = await from.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(50)), true], // Yes に 50 投票
    });
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success');

    let reserves  = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getMarketReserves", args: [],
    }) as unknown as bigint[];
    let scaledValue = BigInt(4000000) * BigInt(toWei(1)) / BigInt(2050);
    expect(reserves).to.deep.equal([BigInt(toWei(2050)), scaledValue]);

    //　期日前償還
    scaledValue = BigInt(toWei(2000)) - BigInt(4000000) * BigInt(toWei(1)) / BigInt(2050);
    reserves  = await publicClient.readContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "getUserBalances", args: [from.account.address],
    }) as unknown as bigint[];
    expect(reserves[1]).to.equal(scaledValue);
    console.log(reserves)

    txHash = await from.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "redeemBeforeResolution", args: [proposalAddress, scaledValue, true],
    });
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success');


    // reserves  = await publicClient.readContract({
    //   address: proposalAddress, abi: abiProposal.abi,
    //   functionName: "getMarketReserves", args: [],
    // }) as unknown as bigint[];
    // expect(reserves).to.deep.equal([BigInt(toWei(2000)), BigInt(toWei(2000))]);
    
  })

  it ("4. ProposalInstance でスワップ", async () => {
    const { publicClient, from, collateral, factory, exchange } = await loadFixture(deploy);
    let txHash: `0x${string}`, receipt: TransactionReceipt;
    
    /* <=== SETUP ===> */
    const setDescription = "Test Proposal", setDuration = BigInt(7 * 24 * 60 * 60);
    await factory.write.createProposal([setDescription, setDuration, collateral.address]);
    const proposalAddress = "0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81"
    await from.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [proposalAddress, BigInt(toWei(5000))]
    })
    await from.writeContract({
      address: proposalAddress, abi: abiProposal.abi,
      functionName: "initializeLiquidity", args: [BigInt(toWei(2000)),BigInt(toWei(2000))]
    })
    await from.writeContract({
      address: collateral.address, abi: abiCollateralMock.abi,
      functionName: "approve", args: [exchange.address, BigInt(toWei(50))]
    })
    txHash = await from.writeContract({
      address: exchange.address, abi: abiExchange.abi,
      functionName: "vote", args: [proposalAddress, BigInt(toWei(50)), true], // Yes に 50 投票
    });
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success');

    /* <=== START ===> */
    let scaledValue = BigInt(toWei(2000)) - BigInt(4000000) * BigInt(toWei(1)) / BigInt(2050);
    await from.writeContract({
      address: exchange.address, abi: abiExchange.abi, functionName: "swap", 
      args: [proposalAddress, scaledValue, true, toWei(1)]
    })
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    expect(receipt.status).to.eq('success');

  })

  // it ("5. ProposalInstance で流動性削除", async () => {
    
  // })
});
