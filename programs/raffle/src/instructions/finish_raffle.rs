use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<FinishRaffle>) -> Result<()> {
  let raffle = &mut ctx.accounts.raffle;

  let clock = Clock::get()?;

  // can only finish the raffle after 48 hours
  if raffle.start_date_timestamps + 48 * 60 * 60 < clock.unix_timestamp {
    return Err(error!(RaffleErrorCode::NoFinishRaffleBefore48H));
  }

  raffle.ended = true;

  Ok(())
}

#[derive(Accounts)]
pub struct FinishRaffle<'info> {
  #[account(mut, has_one = raffle_manager @ RaffleErrorCode::InvalidRaffleManager)]
  pub raffle: Box<Account<'info, Raffle>>,

  #[account(mut)]
  pub raffle_manager: Signer<'info>,
  pub system_program: Program<'info, System>,
}
