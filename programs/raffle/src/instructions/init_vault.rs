use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<InitVault>) -> Result<()> {
  let vault = &mut ctx.accounts.vault;

  let vault_addr = vault.key();
  let payer_addr = ctx.accounts.payer.key();

  let seeds = &[VAULT_PDA_SEED, vault_addr.as_ref()];

  let (vault_authority, vault_authority_bump) = Pubkey::find_program_address(seeds, ctx.program_id);

  vault.creator = payer_addr;
  vault.authority = vault_authority;
  vault.authority_seed = vault_addr;
  vault.authority_bump_seed = [vault_authority_bump];

  Ok(())
}

#[derive(Accounts)]
pub struct InitVault<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
    init,
    seeds = [b"vault-account".as_ref(), payer.key().as_ref()],
    bump,
    payer = payer,
    space = 8 + std::mem::size_of::<Vault>())]
  pub vault: Account<'info, Vault>,

  pub system_program: Program<'info, System>,
}
