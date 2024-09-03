use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

impl<'info> CreateRaffle<'info> {
  fn transer_prize_to_vault(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      from: self.prize_token_account.to_account_info().clone(),
      to: self.prize_box.to_account_info().clone(),
      authority: self.creator.to_account_info().clone(),
    };
    CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<CreateRaffle>,
  _bump_authority: u8,
  raffle_name: String,
  max_entries_per_wallet: u32,
  max_entrants: u32,
  start_date_timestamps: i64,
  end_date_timestamps: i64,
  raffle_price: f32,
  total_winners: u32,
) -> Result<()> {
  let raffle = &mut ctx.accounts.raffle;
  let entrants = &mut ctx.accounts.entrants.load_init()?;
  let vault = &mut ctx.accounts.vault;

  let clock = Clock::get()?;

  if max_entrants > MAX_ENTRANTS {
    return Err(error!(RaffleErrorCode::MaxEntrantsTooLarge));
  }

  if end_date_timestamps < clock.unix_timestamp {
    return Err(error!(RaffleErrorCode::NoPastEndTime));
  }

  if start_date_timestamps < clock.unix_timestamp {
    return Err(error!(RaffleErrorCode::NoPastStartTime));
  }

  if total_winners > max_entrants {
    return Err(error!(RaffleErrorCode::TotalWinnerExceedTotalEntrants));
  }

  entrants.max_entrants = max_entrants;

  raffle.name = raffle_name;
  raffle.entrants = ctx.accounts.entrants.key();
  raffle.winners = Vec::new();
  raffle.total_winners = total_winners;
  raffle.raffle_manager = ctx.accounts.creator.key();
  raffle.max_entries_per_wallet = max_entries_per_wallet;
  raffle.start_date_timestamps = start_date_timestamps;
  raffle.end_date_timestamps = end_date_timestamps;
  raffle.prize_token_account = ctx.accounts.prize_token_account.key();
  raffle.prize_token_mint = ctx.accounts.prize_token_mint.key();
  raffle.spl_token_mint = ctx.accounts.spl_token_mint.key();
  raffle.raffle_price = raffle_price;
  raffle.vault = vault.key();
  raffle.locked = false;
  raffle.ended = false;

  vault.raffle_count += 1;

  // transfer prize to the vault
  // TODO : make optional transfer of prize to vault in case it is wl raffle or something and to support multiple winners
  token::transfer(ctx.accounts.transer_prize_to_vault(), 1)?;

  Ok(())
}

#[derive(Accounts)]
#[instruction(bump_authority: u8)]
pub struct CreateRaffle<'info> {
  #[account(init,
    payer = creator,
    space = 8 + std::mem::size_of::<Raffle>())]
  pub raffle: Account<'info, Raffle>,

  #[account(zero)]
  pub entrants: AccountLoader<'info, Entrants>,

  #[account(mut,has_one = creator, has_one = authority)]
  pub vault: Box<Account<'info, Vault>>,

  /// CHECK:
  #[account(seeds = [&VAULT_PDA_SEED, vault.key().as_ref()], bump = bump_authority)]
  pub authority: AccountInfo<'info>,

  pub spl_token_mint: Account<'info, Mint>,

  // w the winner will win
  pub prize_token_mint: Account<'info, Mint>,
  #[account(mut)]
  pub prize_token_account: Account<'info, TokenAccount>,

  #[account(init_if_needed, seeds = [
    b"token-seed".as_ref(),
    vault.key().as_ref(),
    prize_token_mint.key().as_ref(),
  ],
    bump,
    token::mint = prize_token_mint,
    token::authority = authority,
    payer = creator
  )]
  pub prize_box: Box<Account<'info, TokenAccount>>,

  #[account(mut)]
  pub creator: Signer<'info>,

  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}
