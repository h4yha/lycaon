use anchor_lang::prelude::*;

#[account]
pub struct Tickets {
  pub raffle: Pubkey,
  pub amount: u32,
  pub bump: u8,
}
