use anchor_lang::prelude::*;

pub const VAULT_PDA_SEED: &[u8] = b"vault";

#[account]
pub struct Vault {
  pub creator: Pubkey,

  pub authority: Pubkey,

  pub authority_seed: Pubkey,

  pub authority_bump_seed: [u8; 1],

  /// total number of raffles using this vault
  pub raffle_count: u64,
}
