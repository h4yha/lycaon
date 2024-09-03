use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken,
  token::{self, Mint, Token, TokenAccount, Transfer, CloseAccount},
};

use crate::state::*;

#[error_code]
pub enum ErrorCode {
  #[msg("Invalid token account for this raffle")]
  InvalidTokenAccountProvided,
  #[msg("You are not one of winners to claim the prize, sorry!!")]
  InvalidWinner,
} // todo: refactor to utils

impl<'info> ClaimPrize<'info> {
  fn claim_prize(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      from: self.prize_token_account.to_account_info().clone(),
      to: self.destination_token_account.to_account_info().clone(),
      authority: self.authority.to_account_info().clone(),
    };
    CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
  }

  fn close_prize_account(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
    let cpi_accounts = CloseAccount {
      account: self.prize_token_account.to_account_info().clone(),
      destination: self.destination_token_account.to_account_info().clone(),
      authority: self.authority.to_account_info().clone()
    };

    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<ClaimPrize>, _bump_authority: u8, _bump_prize_token: u8) -> Result<()> {
  let winner = &mut ctx.accounts.winner;
  let raffle = &mut ctx.accounts.raffle;
  let vault = &ctx.accounts.vault;

  if !raffle.winners.contains(&winner.key()) {
    return Err(error!(ErrorCode::InvalidWinner));
  }

  msg!("Congrats, enjoy your prize");

  let seeds = [VAULT_PDA_SEED, vault.authority_seed.as_ref(), &vault.authority_bump_seed];

  token::transfer(ctx.accounts.claim_prize().with_signer(&[&seeds]), 1)?;
  token::close_account(ctx.accounts.close_prize_account().with_signer(&[&seeds]))?;

  Ok(())
}

#[derive(Accounts)]
#[instruction(bump_authority: u8, bump_prize_token: u8)]
pub struct ClaimPrize<'info> {
  #[account(mut)]
  pub raffle: Box<Account<'info, Raffle>>,

  #[account(mut)]
  pub winner: Signer<'info>,

  #[account(mut, has_one = authority)]
  pub vault: Box<Account<'info, Vault>>,

  /// CHECK:
  #[account(seeds = [&VAULT_PDA_SEED, vault.key().as_ref()], bump = bump_authority)]
  pub authority: AccountInfo<'info>,

  #[account(mut, seeds = [
    b"token-seed".as_ref(),
    vault.key().as_ref(),
    token_mint.key().as_ref(),
  ],
    bump = bump_prize_token)]
  pub prize_token_account: Box<Account<'info, TokenAccount>>,

  pub token_mint: Box<Account<'info, Mint>>,

  #[account(init_if_needed,
    associated_token::mint = token_mint,
    associated_token::authority = winner,
    payer = winner, 
    constraint = destination_token_account.mint == raffle.prize_token_mint @ ErrorCode::InvalidTokenAccountProvided
  )]
  pub destination_token_account: Box<Account<'info, TokenAccount>>,

  // Misc.
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}
