export type RaffleIdlType = {
  version: '0.1.0';
  name: 'raffle';
  instructions: [
    {
      name: 'initVault';
      accounts: [
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'createRaffle';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'splTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'prizeTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'prizeTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'prizeBox';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'creator';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'bumpAuthority';
          type: 'u8';
        },
        {
          name: 'raffleName';
          type: 'string';
        },
        {
          name: 'maxEntriesPerWallet';
          type: 'u32';
        },
        {
          name: 'maxEntrants';
          type: 'u32';
        },
        {
          name: 'startDateTimestamps';
          type: 'i64';
        },
        {
          name: 'endDateTimestamps';
          type: 'i64';
        },
        {
          name: 'rafflePrice';
          type: 'f32';
        },
        {
          name: 'totalWinners';
          type: 'u32';
        }
      ];
    },
    {
      name: 'buyTickets';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tickets';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenBox';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'bumpAuthority';
          type: 'u8';
        },
        {
          name: 'amount';
          type: 'u32';
        }
      ];
    },
    {
      name: 'pickWinners';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'entrants';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'slotHashes';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'raffleManager';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'claimPrize';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'winner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'prizeTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'destinationTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'bumpAuthority';
          type: 'u8';
        },
        {
          name: 'bumpPrizeToken';
          type: 'u8';
        }
      ];
    },
    {
      name: 'lockRaffle';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'raffleManager';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'locked';
          type: 'bool';
        }
      ];
    },
    {
      name: 'finishRaffle';
      accounts: [
        {
          name: 'raffle';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'raffleManager';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'entrants';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'totalEntrants';
            type: 'u32';
          },
          {
            name: 'maxEntrants';
            type: 'u32';
          },
          {
            name: 'entries';
            type: {
              array: ['publicKey', 3000];
            };
          }
        ];
      };
    },
    {
      name: 'raffle';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'raffleManager';
            type: 'publicKey';
          },
          {
            name: 'rafflePrice';
            type: 'f32';
          },
          {
            name: 'maxEntriesPerWallet';
            type: 'u32';
          },
          {
            name: 'entrants';
            type: 'publicKey';
          },
          {
            name: 'vault';
            type: 'publicKey';
          },
          {
            name: 'locked';
            type: 'bool';
          },
          {
            name: 'ended';
            type: 'bool';
          },
          {
            name: 'winners';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'totalWinners';
            type: 'u32';
          },
          {
            name: 'prizeTokenMint';
            type: 'publicKey';
          },
          {
            name: 'prizeTokenAccount';
            type: 'publicKey';
          },
          {
            name: 'splTokenMint';
            type: 'publicKey';
          },
          {
            name: 'startDateTimestamps';
            type: 'i64';
          },
          {
            name: 'endDateTimestamps';
            type: 'i64';
          }
        ];
      };
    },
    {
      name: 'tickets';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'raffle';
            type: 'publicKey';
          },
          {
            name: 'amount';
            type: 'u32';
          },
          {
            name: 'bump';
            type: 'u8';
          }
        ];
      };
    },
    {
      name: 'vault';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'creator';
            type: 'publicKey';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'authoritySeed';
            type: 'publicKey';
          },
          {
            name: 'authorityBumpSeed';
            type: {
              array: ['u8', 1];
            };
          },
          {
            name: 'raffleCount';
            type: 'u64';
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'RaffleErrorCode';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'NoTicketsAvailable';
          },
          {
            name: 'MaxEntrantsTooLarge';
          },
          {
            name: 'NoPastEndTime';
          },
          {
            name: 'NoPastStartTime';
          },
          {
            name: 'TotalWinnerExceedTotalEntrants';
          },
          {
            name: 'WinnersAlreadyPicked';
          },
          {
            name: 'InvalidRaffleManager';
          },
          {
            name: 'RaffleEnded';
          },
          {
            name: 'InvalidTokenAccountProvided';
          },
          {
            name: 'RaffleLocked';
          },
          {
            name: 'RaffleNotFinishedYet';
          },
          {
            name: 'NoFinishRaffleBefore48H';
          },
          {
            name: 'MoreEntriesThanAllowed';
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'InvalidTokenAccountProvided';
      msg: 'Invalid token account for this raffle';
    },
    {
      code: 6001;
      name: 'InvalidWinner';
      msg: 'You are not one of winners to claim the prize, sorry!!';
    }
  ];
};

export const IDL: RaffleIdlType = {
  version: '0.1.0',
  name: 'raffle',
  instructions: [
    {
      name: 'initVault',
      accounts: [
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createRaffle',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'splTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'prizeTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'prizeTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'prizeBox',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'creator',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bumpAuthority',
          type: 'u8',
        },
        {
          name: 'raffleName',
          type: 'string',
        },
        {
          name: 'maxEntriesPerWallet',
          type: 'u32',
        },
        {
          name: 'maxEntrants',
          type: 'u32',
        },
        {
          name: 'startDateTimestamps',
          type: 'i64',
        },
        {
          name: 'endDateTimestamps',
          type: 'i64',
        },
        {
          name: 'rafflePrice',
          type: 'f32',
        },
        {
          name: 'totalWinners',
          type: 'u32',
        },
      ],
    },
    {
      name: 'buyTickets',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tickets',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenBox',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bumpAuthority',
          type: 'u8',
        },
        {
          name: 'amount',
          type: 'u32',
        },
      ],
    },
    {
      name: 'pickWinners',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'entrants',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'slotHashes',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'raffleManager',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'claimPrize',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'winner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'prizeTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'destinationTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bumpAuthority',
          type: 'u8',
        },
        {
          name: 'bumpPrizeToken',
          type: 'u8',
        },
      ],
    },
    {
      name: 'lockRaffle',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'raffleManager',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'locked',
          type: 'bool',
        },
      ],
    },
    {
      name: 'finishRaffle',
      accounts: [
        {
          name: 'raffle',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'raffleManager',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'entrants',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'totalEntrants',
            type: 'u32',
          },
          {
            name: 'maxEntrants',
            type: 'u32',
          },
          {
            name: 'entries',
            type: {
              array: ['publicKey', 3000],
            },
          },
        ],
      },
    },
    {
      name: 'raffle',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'raffleManager',
            type: 'publicKey',
          },
          {
            name: 'rafflePrice',
            type: 'f32',
          },
          {
            name: 'maxEntriesPerWallet',
            type: 'u32',
          },
          {
            name: 'entrants',
            type: 'publicKey',
          },
          {
            name: 'vault',
            type: 'publicKey',
          },
          {
            name: 'locked',
            type: 'bool',
          },
          {
            name: 'ended',
            type: 'bool',
          },
          {
            name: 'winners',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'totalWinners',
            type: 'u32',
          },
          {
            name: 'prizeTokenMint',
            type: 'publicKey',
          },
          {
            name: 'prizeTokenAccount',
            type: 'publicKey',
          },
          {
            name: 'splTokenMint',
            type: 'publicKey',
          },
          {
            name: 'startDateTimestamps',
            type: 'i64',
          },
          {
            name: 'endDateTimestamps',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'tickets',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'raffle',
            type: 'publicKey',
          },
          {
            name: 'amount',
            type: 'u32',
          },
          {
            name: 'bump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'vault',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'creator',
            type: 'publicKey',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'authoritySeed',
            type: 'publicKey',
          },
          {
            name: 'authorityBumpSeed',
            type: {
              array: ['u8', 1],
            },
          },
          {
            name: 'raffleCount',
            type: 'u64',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'RaffleErrorCode',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'NoTicketsAvailable',
          },
          {
            name: 'MaxEntrantsTooLarge',
          },
          {
            name: 'NoPastEndTime',
          },
          {
            name: 'NoPastStartTime',
          },
          {
            name: 'TotalWinnerExceedTotalEntrants',
          },
          {
            name: 'WinnersAlreadyPicked',
          },
          {
            name: 'InvalidRaffleManager',
          },
          {
            name: 'RaffleEnded',
          },
          {
            name: 'InvalidTokenAccountProvided',
          },
          {
            name: 'RaffleLocked',
          },
          {
            name: 'RaffleNotFinishedYet',
          },
          {
            name: 'NoFinishRaffleBefore48H',
          },
          {
            name: 'MoreEntriesThanAllowed',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidTokenAccountProvided',
      msg: 'Invalid token account for this raffle',
    },
    {
      code: 6001,
      name: 'InvalidWinner',
      msg: 'You are not one of winners to claim the prize, sorry!!',
    },
  ],
};
