use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<PickWinner>) -> Result<()> {
  let raffle = &mut ctx.accounts.raffle;
  let entrants = ctx.accounts.entrants.load_mut()?;

  let slot_hashes = &ctx.accounts.slot_hashes;

  let total_winners = raffle.total_winners as usize;

  let clock = Clock::get()?;

  if !raffle.ended && raffle.end_date_timestamps > clock.unix_timestamp {
    return Err(error!(RaffleErrorCode::RaffleNotFinishedYet));
  }

  if raffle.winners.len() >= total_winners {
    return Err(error!(RaffleErrorCode::WinnersAlreadyPicked));
  }

  let total_entrants = entrants.total_entrants;

  let random = u64::from_le_bytes(
    slot_hashes.to_account_info().data.borrow()[16..24]
      .try_into()
      .unwrap(),
  );

  let winner_index = random % (total_entrants as u64);

  msg!(
    "Number random {}, winner: {}, total_entrants: {}",
    random,
    winner_index,
    total_entrants
  );

  let winner = entrants.entries[winner_index as usize];

  raffle.winners.push(winner);

  Ok(())
}

#[derive(Accounts)]
pub struct PickWinner<'info> {
  // raffle
  #[account(mut, has_one = entrants, has_one = raffle_manager @ RaffleErrorCode::InvalidRaffleManager)]
  pub raffle: Box<Account<'info, Raffle>>,
  #[account(mut)]
  pub entrants: AccountLoader<'info, Entrants>,
  /// CHECK:
  pub slot_hashes: UncheckedAccount<'info>,

  // misc
  #[account(mut)]
  pub raffle_manager: Signer<'info>,
  pub system_program: Program<'info, System>,
}
