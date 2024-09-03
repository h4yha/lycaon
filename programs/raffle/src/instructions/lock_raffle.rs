use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<LockRaffle>, locked: bool) -> Result<()> {
  let raffle = &mut ctx.accounts.raffle;

  let clock = Clock::get()?;

  if raffle.end_date_timestamps < clock.unix_timestamp {
    return Err(error!(RaffleErrorCode::RaffleEnded));
  }

  raffle.locked = locked;

  Ok(())
}

#[derive(Accounts)]
pub struct LockRaffle<'info> {
  #[account(mut, has_one = raffle_manager @ RaffleErrorCode::InvalidRaffleManager)]
  pub raffle: Box<Account<'info, Raffle>>,

  #[account(mut)]
  pub raffle_manager: Signer<'info>,
  pub system_program: Program<'info, System>,
}
