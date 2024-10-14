const credAbi = [{ "type": "constructor", "inputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "allowance", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "spender", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "approve", "inputs": [{ "name": "spender", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "nonpayable" }, { "type": "function", "name": "balanceOf", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "burnCred", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }, { "name": "reason", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "decimals", "inputs": [], "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }], "stateMutability": "view" }, { "type": "function", "name": "initialize", "inputs": [{ "name": "peerLink", "type": "address", "internalType": "address" }, { "name": "peerGroup", "type": "address", "internalType": "address" }, { "name": "peerChat", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "mintCred", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "amount", "type": "uint256", "internalType": "uint256" }, { "name": "reason", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "name", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "rewardPurposes", "inputs": [{ "name": "", "type": "uint8", "internalType": "enum Cred.RewardPurpose" }], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "symbol", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "totalSupply", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "transfer", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "nonpayable" }, { "type": "function", "name": "transferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "value", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "nonpayable" }, { "type": "event", "name": "Approval", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "spender", "type": "address", "indexed": true, "internalType": "address" }, { "name": "value", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "Cred__CredBurned", "inputs": [{ "name": "", "type": "address", "indexed": true, "internalType": "address" }, { "name": "", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "purpose", "type": "string", "indexed": false, "internalType": "string" }], "anonymous": false }, { "type": "event", "name": "Cred__CredMinted", "inputs": [{ "name": "", "type": "address", "indexed": true, "internalType": "address" }, { "name": "", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "purpose", "type": "string", "indexed": false, "internalType": "string" }], "anonymous": false }, { "type": "event", "name": "Cred__totalSupply", "inputs": [{ "name": "supply", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "previousSupply", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true, "internalType": "address" }, { "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "value", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "error", "name": "Cred__OnlyPeerLinkSystemCanCallThisFunction", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "Cred__PeerLinkAddressNotSet", "inputs": [] }, { "type": "error", "name": "ERC20InsufficientAllowance", "inputs": [{ "name": "spender", "type": "address", "internalType": "address" }, { "name": "allowance", "type": "uint256", "internalType": "uint256" }, { "name": "needed", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "ERC20InsufficientBalance", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }, { "name": "balance", "type": "uint256", "internalType": "uint256" }, { "name": "needed", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "ERC20InvalidApprover", "inputs": [{ "name": "approver", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC20InvalidReceiver", "inputs": [{ "name": "receiver", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC20InvalidSender", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC20InvalidSpender", "inputs": [{ "name": "spender", "type": "address", "internalType": "address" }] }]
export default credAbi