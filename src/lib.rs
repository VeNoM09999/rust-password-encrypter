use rand::{Rng, distr::Alphanumeric};

pub enum AppLoadState {
    NotSaved,
    Saved,
    Update,
    Update_Key,
}

pub fn random_id(len: usize) -> String {
    rand::rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect()
}
