interface Proposal {
	id: number;
	submitter: `0x${string}`;
	proposalAddress: `0x${string}`;
	title: string;
	description: string;
	start: string;
	duration: string;
	collateralAddress: `0x${string}`;
  }
  