const inputContractABI = [
    {
      "inputs": [],
      "name": "InputSizeExceedsLimit",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "dapp",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "inputIndex",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "input",
          "type": "bytes"
        }
      ],
      "name": "InputAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_dapp",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_input",
          "type": "bytes"
        }
      ],
      "name": "addInput",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_dapp",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getInputHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_dapp",
          "type": "address"
        }
      ],
      "name": "getNumberOfInputs",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
const genericERC20ContractABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]
const genericERC721ContractABI =  [
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {
      "indexed": true,
      "internalType": "address",
      "name": "approved",
      "type": "address"
    }, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {
      "indexed": true,
      "internalType": "address",
      "name": "operator",
      "type": "address"
    }, {"indexed": false, "internalType": "bool", "name": "approved", "type": "bool"}],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "balance", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getApproved",
    "outputs": [{"internalType": "address", "name": "operator", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {
      "internalType": "address",
      "name": "operator",
      "type": "address"
    }],
    "name": "isApprovedForAll",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "operator", "type": "address"}, {
      "internalType": "bool",
      "name": "_approved",
      "type": "bool"
    }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
    "name": "supportsInterface",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
const erc20PortalsContractABI = [
    {
      "inputs": [
        {
          "internalType": "contract IInputBox",
          "name": "_inputBox",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "contract IERC20",
          "name": "_token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_dapp",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_execLayerData",
          "type": "bytes"
        }
      ],
      "name": "depositERC20Tokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getInputBox",
      "outputs": [
        {
          "internalType": "contract IInputBox",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
const dappContractABI = [
    {
      "inputs": [
        {
          "internalType": "contract IConsensus",
          "name": "_consensus",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "_templateHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "EtherTransferFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "IncorrectEpochHash",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "IncorrectOutputHashesRootHash",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "IncorrectOutputsEpochRootHash",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InputIndexOutOfClaimBounds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyDApp",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "VoucherReexecutionNotAllowed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "contract IConsensus",
          "name": "newConsensus",
          "type": "address"
        }
      ],
      "name": "NewConsensus",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "voucherId",
          "type": "uint256"
        }
      ],
      "name": "VoucherExecuted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_destination",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_payload",
          "type": "bytes"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "uint64",
                  "name": "inputIndexWithinEpoch",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "outputIndexWithinInput",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "outputHashesRootHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "vouchersEpochRootHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "noticesEpochRootHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "machineStateHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "outputHashInOutputHashesSiblings",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "outputHashesInEpochSiblings",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct OutputValidityProof",
              "name": "validity",
              "type": "tuple"
            },
            {
              "internalType": "bytes",
              "name": "context",
              "type": "bytes"
            }
          ],
          "internalType": "struct Proof",
          "name": "_proof",
          "type": "tuple"
        }
      ],
      "name": "executeVoucher",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getConsensus",
      "outputs": [
        {
          "internalType": "contract IConsensus",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTemplateHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract IConsensus",
          "name": "_newConsensus",
          "type": "address"
        }
      ],
      "name": "migrateToConsensus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155BatchReceived",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC721Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_notice",
          "type": "bytes"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "uint64",
                  "name": "inputIndexWithinEpoch",
                  "type": "uint64"
                },
                {
                  "internalType": "uint64",
                  "name": "outputIndexWithinInput",
                  "type": "uint64"
                },
                {
                  "internalType": "bytes32",
                  "name": "outputHashesRootHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "vouchersEpochRootHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "noticesEpochRootHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "machineStateHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "outputHashInOutputHashesSiblings",
                  "type": "bytes32[]"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "outputHashesInEpochSiblings",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct OutputValidityProof",
              "name": "validity",
              "type": "tuple"
            },
            {
              "internalType": "bytes",
              "name": "context",
              "type": "bytes"
            }
          ],
          "internalType": "struct Proof",
          "name": "_proof",
          "type": "tuple"
        }
      ],
      "name": "validateNotice",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_inputIndex",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_outputIndexWithinInput",
          "type": "uint256"
        }
      ],
      "name": "wasVoucherExecuted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "withdrawEther",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ]
const etherPortalContractABI = [
  {
    "inputs": [
      {
        "internalType": "contract IInputBox",
        "name": "_inputBox",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EtherTransferFailed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_dapp",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "_execLayerData",
        "type": "bytes"
      }
    ],
    "name": "depositEther",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getInputBox",
    "outputs": [
      {
        "internalType": "contract IInputBox",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
const erc721PortalContractABI = [
  {
    "inputs": [
      {
        "internalType": "contract IInputBox",
        "name": "_inputBox",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC721",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_dapp",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_baseLayerData",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "_execLayerData",
        "type": "bytes"
      }
    ],
    "name": "depositERC721Token",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getInputBox",
    "outputs": [
      {
        "internalType": "contract IInputBox",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const dappAddressRelayContractABI = [
  {
    "inputs": [
      {
        "internalType": "contract IInputBox",
        "name": "_inputBox",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "getInputBox",
    "outputs": [
      {
        "internalType": "contract IInputBox",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_dapp",
        "type": "address"
      }
    ],
    "name": "relayDAppAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


export {
  dappContractABI,
  inputContractABI,
  genericERC20ContractABI,
  genericERC721ContractABI,
  erc20PortalsContractABI,
  etherPortalContractABI,
  erc721PortalContractABI,
  dappAddressRelayContractABI
}