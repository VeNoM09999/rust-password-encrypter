use std::{
    fs::{self, File},
    io::Write,
};

use aes_gcm::{
    Aes256Gcm, Key, KeyInit,
    aead::{Aead, Nonce},
};
use rand::random;

use crate::CredsStructDTO;

// #[derive(Debug, Serialize, Deserialize)]
// pub struct CustomData {
//     pub key: String,
//     pub value: String,
// }

pub struct CustomEncryption {
    keys: [u8; 64],
    pub decrypted: Option<Vec<CredsStructDTO>>,
    encrypted_bytes: Vec<u8>,
}

impl CustomEncryption {
    // pub fn new(keys_bytes: [u8;64], encrypted_bytes:Vec<u8>) -> Self {
    //     Self { keys: keys_bytes, decrypted: None, encrypted_bytes: encrypted_bytes }
    // }

    pub fn encrypt(&self, plaintext: &[u8]) -> Vec<u8> {
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

        [nonce1.to_vec(), nonce2.to_vec(), encrypted2].concat()
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

    pub fn read() -> Self {
        let encrypted_bytes = fs::read("data.enc").unwrap_or_else(|err| {
            eprintln!("Failed to read data.enc {err}, using empty encrypted data");
            Vec::new()
        });

        let key_file = fs::read("key.bin").unwrap_or_else(|err| {
            eprintln!("No keys found , default to creating a new one");
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

        Self {
            keys: key_bytes,
            decrypted: None,
            encrypted_bytes: encrypted_bytes,
        }
    }

    fn save_key(bytes: &[u8]) {
        let mut file = File::create_new("key.bin").expect("Failed to create key file");

        let _ = file.write_all(bytes);
    }
}
