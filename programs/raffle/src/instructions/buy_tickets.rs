use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::*;

impl<'info> BuyTickets<'info> {
  fn buy_tickets(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    CpiContext::new(
      self.token_program.to_account_info(),
      Transfer {
        from: self.token_account.to_account_info(),
        to: self.token_box.to_account_info(),
        authority: self.payer.to_account_info(),
      },
    )
  }
}

pub fn handler(ctx: Context<BuyTickets>, _bump_authority: u8, amount: u32) -> Result<()> {
  let payer = ctx.accounts.payer.key();
  let raffle = &mut ctx.accounts.raffle;
  let tickets = &mut ctx.accounts.tickets;
  let total_raffle_price = amount * raffle.raffle_price as u32;
  let entrants = &mut ctx.accounts.entrants.load_mut()?;

  let clock = Clock::get()?;

  if raffle.locked {
    return Err(error!(RaffleErrorCode::RaffleLocked));
  }

  if raffle.ended || raffle.end_date_timestamps < clock.unix_timestamp {
    return Err(error!(RaffleErrorCode::RaffleEnded));
  }

  if amount > raffle.max_entries_per_wallet {
    return Err(error!(RaffleErrorCode::MoreEntriesThanAllowed));
  }

  tickets.bump = *ctx.bumps.get("tickets").unwrap();

  tickets.amount = if tickets.amount > 0 {
    tickets.amount + amount
  } else {
    amount
  };
  tickets.raffle = raffle.key();

  for _x in 0..amount {
    entrants.append(payer)?;
  }

  msg!(
    "gl in the raffle. You have bought {} tickets for {}",
    amount,
    raffle.name
  );

  token::transfer(ctx.accounts.buy_tickets(), total_raffle_price.into())?;

  Ok(())
}

#[derive(Accounts)]
#[instruction(bump_authority: u8)]
pub struct BuyTickets<'info> {
  #[account(mut, has_one = entrants, constraint = entrants.key() == raffle.entrants)]
  pub raffle: Box<Account<'info, Raffle>>,

  #[account(mut)]
  pub entrants: AccountLoader<'info, Entrants>,

  #[account(mut)]
  pub payer: Signer<'info>,

  // this make senses?
  #[account(init_if_needed, seeds = [
        b"tickets".as_ref(),
        raffle.key().as_ref(),
        payer.key().as_ref(),
    ],
    bump,
    payer = payer,
    space = 8 + std::mem::size_of::<Tickets>())]
  pub tickets: Account<'info, Tickets>,

  #[account(mut, has_one = authority)]
  pub vault: Box<Account<'info, Vault>>,

  /// CHECK:
  #[account(seeds = [&VAULT_PDA_SEED, vault.key().as_ref()], bump = bump_authority)]
  pub authority: AccountInfo<'info>,

  #[account(init_if_needed, seeds = [
    b"token-seed".as_ref(),
    vault.key().as_ref(),
    token_mint.key().as_ref(),
  ],
    bump,
    token::mint = token_mint,
    token::authority = authority,
    payer = payer
  )]
  pub token_box: Box<Account<'info, TokenAccount>>,

  pub token_mint: Account<'info, Mint>,
  #[account(mut, constraint = token_account.mint == raffle.spl_token_mint @ RaffleErrorCode::InvalidTokenAccountProvided)]
  pub token_account: Box<Account<'info, TokenAccount>>,

  // Misc.
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}
