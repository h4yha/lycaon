use anchor_lang::prelude::*;
use instructions::*;

declare_id!("GFe7k4SGs25xJ3QH9ktpZyZRaFEGTd97qx4kmE1YsSvL");

pub mod instructions;
pub mod state;

#[program]
pub mod raffle {
    use super::*;

    pub fn init_vault(ctx: Context<InitVault>) -> Result<()> {
        instructions::init_vault::handler(ctx)
    }

    pub fn create_raffle(
        ctx: Context<CreateRaffle>,
        bump_authority: u8,
        raffle_name: String,
        max_entries_per_wallet: u32,
        max_entrants: u32,
        start_date_timestamps: i64,
        end_date_timestamps: i64,
        raffle_price: f32,
        total_winners: u32,
    ) -> Result<()> {
        instructions::create_raffle::handler(
            ctx,
            bump_authority,
            raffle_name,
            max_entries_per_wallet,
            max_entrants,
            start_date_timestamps,
            end_date_timestamps,
            raffle_price,
            total_winners,
        )
    }

    pub fn buy_tickets(ctx: Context<BuyTickets>, bump_authority: u8, amount: u32) -> Result<()> {
        instructions::buy_tickets::handler(ctx, bump_authority, amount)
    }

    pub fn pick_winners(ctx: Context<PickWinner>) -> Result<()> {
        instructions::pick_winners::handler(ctx)
    }

    pub fn claim_prize(
        ctx: Context<ClaimPrize>,
        bump_authority: u8,
        bump_prize_token: u8,
    ) -> Result<()> {
        instructions::claim_prize::handler(ctx, bump_authority, bump_prize_token)
    }

    pub fn claim_proceeds(
        ctx: Context<ClaimProceeds>,
        bump_authority: u8,
        bump_proceeds_token: u8,
    ) -> Result<()> {
        instructions::claim_proceeds::handler(ctx, bump_authority, bump_proceeds_token)
    }

    pub fn lock_raffle(ctx: Context<LockRaffle>, locked: bool) -> Result<()> {
        instructions::lock_raffle::handler(ctx, locked)
    }

    pub fn finish_raffle(ctx: Context<FinishRaffle>) -> Result<()> {
        instructions::finish_raffle::handler(ctx)
    }
}
