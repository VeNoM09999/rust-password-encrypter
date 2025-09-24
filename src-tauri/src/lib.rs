use tauri::{AppHandle, Emitter, Manager};

use crate::encryption::encryt::{read_bytes, save_bytes, CustomData, CustomEncryption};

// use crate::encryption::encryt::{CustomData, CustomEncryption};

mod encryption;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, onload, onsave])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn onload(app: tauri::AppHandle) {
    // app
    //     .emit("init-load", "Hey!")
    //     .expect("failed to emit event!");

    let val = read_bytes(encryption::encryt::EncryptionFile::EncrytedFile);

    match val {
        Ok(vec) => {
            let encryption = CustomEncryption::read();

            let decrypted = encryption.decrypt(vec);

            if let Ok(d) = decrypted {
                app.emit("init-load", &d).unwrap();
            }
        }
        Err(_e) => {
            eprintln!("Error Reading bytes data.enc , returning empty vec");
            let empty: Vec<CustomData> = Vec::new();
            app.emit("init-load", &empty).unwrap();
        }
    }

    dbg!("Called! onload!");
    // Send some info to frontend.
}

#[tauri::command]
fn onsave(app: tauri::AppHandle, plaintext: &str) -> bool {
    let encrypt = CustomEncryption::read();

    let encrypted_data = match encrypt.encrypt(plaintext.as_bytes()) {
        Ok(v) => v,
        Err(e) => vec![],
    };
    save_bytes(encryption::encryt::EncryptionFile::EncrytedFile,&encrypted_data)
}
