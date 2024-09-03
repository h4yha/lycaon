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

impl<'info> ClaimProceeds<'info> {
  fn claim_prize(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      from: self.proceeds_token_account.to_account_info().clone(),
      to: self.destination_token_account.to_account_info().clone(),
      authority: self.authority.to_account_info().clone(),
    };
    CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
  }

  fn close_prize_account(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
    let cpi_accounts = CloseAccount {
      account: self.proceeds_token_account.to_account_info().clone(),
      destination: self.destination_token_account.to_account_info().clone(),
      authority: self.authority.to_account_info().clone()
    };

    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<ClaimProceeds>, _bump_authority: u8, _bump_proceeds_token: u8) -> Result<()> {
  let raffle = &mut ctx.accounts.raffle;
  let vault = &ctx.accounts.vault;
  let entrants = &mut ctx.accounts.entrants.load_mut()?;

  let seeds = [VAULT_PDA_SEED, vault.authority_seed.as_ref(), &vault.authority_bump_seed];

  // get amount of proceeds from this raffle account passed on ix
  let amount = raffle.raffle_price as u32 * entrants.total_entrants;

  token::transfer(ctx.accounts.claim_prize().with_signer(&[&seeds]), amount.into())?;
  token::close_account(ctx.accounts.close_prize_account().with_signer(&[&seeds]))?;

  Ok(())
}

#[derive(Accounts)]
#[instruction(bump_authority: u8, bump_proceeds_token: u8)]
pub struct ClaimProceeds<'info> {
  #[account(mut, has_one = raffle_manager)]
  pub raffle: Box<Account<'info, Raffle>>,

  #[account(mut)]
  pub raffle_manager: Signer<'info>,

  #[account(mut, has_one = authority)]
  pub vault: Box<Account<'info, Vault>>,

  #[account(mut)]
  pub entrants: AccountLoader<'info, Entrants>,

  /// CHECK:
  #[account(seeds = [&VAULT_PDA_SEED, vault.key().as_ref()], bump = bump_authority)]
  pub authority: AccountInfo<'info>,

  #[account(mut, seeds = [
    b"token-seed".as_ref(),
    vault.key().as_ref(),
    token_mint.key().as_ref(),
  ],
    bump = bump_proceeds_token)]
  pub proceeds_token_account: Box<Account<'info, TokenAccount>>,

  pub token_mint: Box<Account<'info, Mint>>,

  #[account(init_if_needed,
    associated_token::mint = token_mint,
    associated_token::authority = raffle_manager,
    payer = raffle_manager, 
    constraint = destination_token_account.mint == raffle.spl_token_mint @ ErrorCode::InvalidTokenAccountProvided
  )]
  pub destination_token_account: Box<Account<'info, TokenAccount>>,

  // Misc.
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}
