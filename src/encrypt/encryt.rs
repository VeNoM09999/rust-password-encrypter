use crate::CredsStructDTO;
use aes_gcm::{
    Aes256Gcm, Key, KeyInit,
    aead::{Aead, Nonce},
};
use anyhow::{Context, Result};
use rand::random;
use std::{
    fs::{self, File},
    io::Write,
    path::PathBuf,
};

enum EncryptorFileTypes {
    DataFile,
    KeyFile,
}

enum EncrypterErrors {
    SavingError,
}

impl From<EncrypterErrors> for anyhow::Error {
    fn from(value: EncrypterErrors) -> Self {
        anyhow::anyhow!(value)
    }
}

pub struct CustomEncryption {
    keys: [u8; 64],
    pub decrypted: Option<Vec<CredsStructDTO>>,
    encrypted_bytes: Vec<u8>,
}

impl Default for CustomEncryption {
    fn default() -> Self {
        CustomEncryption::new()
    }
}

impl CustomEncryption {
    pub fn encrypt(&mut self, plaintext: &[u8]) {
        let nonce1: [u8; 12] = random();
        let nonce2: [u8; 12] = random();

        let key1 = Key::<Aes256Gcm>::from_slice(&self.keys[..32]);
        let c1 = Aes256Gcm::new(key1);

        let encrypted1 = c1
            .encrypt(Nonce::<Aes256Gcm>::from_slice(&nonce1), plaintext)
            .unwrap();

        let c2 = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.keys[32..64]));

        let encrypted2 = c2
            .encrypt(Nonce::<Aes256Gcm>::from_slice(&nonce2), &*encrypted1)
            .unwrap();

        self.encrypted_bytes = [nonce1.to_vec(), nonce2.to_vec(), encrypted2].concat();
    }

    pub fn create_keys() -> [u8; 64] {
        let k1: [u8; 32] = rand::random();
        let k2: [u8; 32] = rand::random();

        let mut combined = [0u8; 64];

        combined[..32].copy_from_slice(&k1);
        combined[32..64].copy_from_slice(&k2);

        combined
    }

    pub fn decrypt(&mut self) {
        if self.encrypted_bytes.len() < 32 {
            eprintln!("Not enough bytes to decrypt original data from!");
            return;
        }
        let nonce1_slice = &self.encrypted_bytes[0..12];
        let nonce2_slice = &self.encrypted_bytes[12..24];
        let actual_encrypted_bytes = &self.encrypted_bytes[24..];

        let nonce1: &[u8; 12] = nonce1_slice
            .try_into()
            .expect("Encrypted vec must be exactly 12 bytes");
        let nonce2: &[u8; 12] = nonce2_slice
            .try_into()
            .expect("Encrypted vec must be a size of 12 bytes");

        let decrypt2_key = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.keys[32..64]));
        let decrypt1_key = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.keys[..32]));

        let half_decrypted = decrypt2_key
            .decrypt(
                Nonce::<Aes256Gcm>::from_slice(nonce2),
                actual_encrypted_bytes,
            )
            .unwrap();

        let full_decrypted = decrypt1_key
            .decrypt(Nonce::<Aes256Gcm>::from_slice(nonce1), &*half_decrypted)
            .unwrap();

        let decrypted_slice = full_decrypted.as_slice();
        let value: Vec<CredsStructDTO> = serde_json::from_slice(&decrypted_slice).unwrap();

        self.decrypted = Some(value);
    }

    pub fn new() -> Self {
        // ! >> TODO >> Create a in memory data and again on new creation ask for saving old

        Self {
            keys: CustomEncryption::create_keys(),
            decrypted: None,
            encrypted_bytes: Vec::new(),
        }
    }

    pub fn read() -> Result<Self> {
        let data_path = CustomEncryption::open_file_dialog(EncryptorFileTypes::DataFile)?;

        let encrypted_bytes = fs::read(data_path).unwrap_or_else(|err| {
            eprintln!("Failed to read data.enc {err}, using empty encrypted data");
            Vec::new()
        });

        let key_path = CustomEncryption::open_file_dialog(EncryptorFileTypes::KeyFile)?;
        let key_file = fs::read(key_path).unwrap_or_else(|err| {
            eprintln!("No keys found {err}, default to creating a new one");
            vec![]
        });
        let mut key_bytes = [0u8; 64]; // Creating a buffer to key bytes to add to..

        if key_file.len() < 64 {
            eprintln!("corrupted key file detected!, creating a new...");
            key_bytes = CustomEncryption::create_keys();
            CustomEncryption::save_key(&key_bytes);
        } else {
            key_bytes = key_file.try_into().unwrap();
        };

        Ok(Self {
            keys: key_bytes,
            decrypted: None,
            encrypted_bytes: encrypted_bytes,
        })
    }

    pub fn p_save_key(&self) {
        CustomEncryption::save_key(&self.keys);
    }

    pub fn p_save_data(&self) {
        CustomEncryption::save_data(&self);
    }

    fn save_key(bytes: &[u8]) {
        let key_save_path = CustomEncryption::save_file_dialog(EncryptorFileTypes::KeyFile);
        if let Ok(path) = key_save_path {
            let mut file = File::create(path).expect("Failed to create key file");
            let _ = file.write_all(bytes);
            let _ = file.flush();
        }
    }

    fn save_data(&self) {
        let save_path = CustomEncryption::save_file_dialog(EncryptorFileTypes::DataFile);
        let Ok(dir) = save_path else {
            return;
        };

        let mut file = File::create(dir).expect("Failed to create encrypted data file");
        let _ = file.write_all(&self.encrypted_bytes);
        let _ = file.flush();
    }

    fn open_file_dialog(file_type: EncryptorFileTypes) -> Result<PathBuf> {
        let file_dialog = match file_type {
            EncryptorFileTypes::DataFile => rfd::FileDialog::new()
                .add_filter("enc", &["enc"])
                .set_title("Select Data File .enc")
                .pick_file(),
            EncryptorFileTypes::KeyFile => rfd::FileDialog::new()
                .add_filter("key", &["ckey"])
                .set_title("Select Key file .ckey")
                .pick_file(),
        };
        file_dialog.context("No Selection")
    }

    fn save_file_dialog(file_type: EncryptorFileTypes) -> Result<PathBuf> {
        match file_type {
            EncryptorFileTypes::DataFile => {
                let data_save_path = rfd::FileDialog::new()
                    .set_title("Select place to save the encrypted data file")
                    .add_filter("enc", &["enc"])
                    .save_file();
                let result = match data_save_path {
                    None => Err(EncrypterErrors::SavingError)?,
                    Some(val) => Ok(val),
                };
                result
            }
            EncryptorFileTypes::KeyFile => {
                let key_save_path = rfd::FileDialog::new()
                    .set_title("Select place to save key file")
                    .add_filter("keyfile", &["ckey"])
                    .save_file();

                let result = match key_save_path {
                    None => Err(EncrypterErrors::SavingError)?,
                    Some(val) => Ok(val),
                };
                result
            }
        }
    }
}
