// import { expect } from "chai";
// import hre from "hardhat";
// import { createPublicClient, createWalletClient, http } from "viem";
// import { hardhat } from "viem/chains";
// import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

// describe("Deployment Test for Factory-Proxy-Target", function () {
// 	const deploy = async () => {
// 		const [owner, user] = await hre.viem.getWalletClients();

// 		const targetV1 = await hre.viem.deployContract("TargetV1", []);
// 		const factory = await hre.viem.deployContract("Factory", [targetV1.address]);
// 		const proxy = await hre.viem.deployContract("Proxy", [targetV1.address]);
// 		// const target = await owner.deployContract("Target", []);
// 		// const factory = await owner.deployContract("Factory", [target.address]);
// 		// const proxy = await owner.deployContract("Proxy", [factory.address]);
	
// 		return { owner, user, targetV1, proxy, factory };
// 	};
// 	it("Print address", async function () {
// 		const { targetV1, proxy, factory } = await loadFixture(deploy);
// 		console.log("Target	:", targetV1.address);
// 		console.log("Proxy	:",proxy.address);
// 		console.log("Factory	:", factory.address);
// 	})

// 	it("Should create a new Proxy through the Factory", async function () {
// 		const { factory } = await loadFixture(deploy);
		
// 		expect(await factory.read.getProxies()).to.deep.eq([]);
// 		for (let i = 0; i < 50; i++) await factory.write.createProxy();
// 		expect((await factory.read.getProxies()).length).to.eq(50);
// 	})

// 	it("Should set and get value through Proxy", async function () {
// 		const { owner, targetV1, proxy, factory } = await loadFixture(deploy);
		
// 		const client = createPublicClient({
// 			chain: hardhat,
// 			transport: http()
// 		})

		
// 		// expect(await factory.read.getProxies()).to.deep.eq([]);
// 		await factory.write.createProxy();
// 		const [p] = await factory.read.getProxies();

// 		// const init = await owner.writeContract({
// 		// 	address: p,
// 		// 	abi: targetV1.abi,
// 		// 	functionName: "initialize",
// 		// 	args: [(await owner.getAddresses())[0]],
// 		// })

// 		// const data = await client.readContract({
// 		// 	address: p,
// 		// 	abi: proxy.abi,
// 		// 	functionName: 'owner',
// 		// 	args: []
// 		// })
// 		// console.log()
// 		// expect(await proxy.read.owner()).to.eq((await owner.getAddresses())[0]);
// 		// const setTx = await owner.writeContract({
// 		// 	address: p,
// 		// 	abi: targetV1.abi,
// 		// 	functionName: "setValue",
// 		// 	args: [BigInt(42)],
// 		// })
// 		// console.log(owner)

// 	  });
// });
