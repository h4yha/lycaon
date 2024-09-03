use anchor_lang::prelude::*;

use crate::state::RaffleErrorCode;

pub const MAX_ENTRANTS: u32 = 3000;

impl Entrants {
  pub fn append(&mut self, entrant: Pubkey) -> Result<()> {
    if self.total_entrants >= self.max_entrants {
      return Err(error!(RaffleErrorCode::NoTicketsAvailable));
    }
    self.entries[self.total_entrants as usize] = entrant;
    self.total_entrants += 1;
    Ok(())
  }
}

#[account(zero_copy)]
pub struct Entrants {
  pub total_entrants: u32,
  pub max_entrants: u32,
  pub entries: [Pubkey; 3000],
}
