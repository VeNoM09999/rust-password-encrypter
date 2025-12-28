use arboard::Clipboard;
use creds_app_iced::{AppLoadState, random_id};
// #![allow(dead_code, unused_variables)]
use serde::{Deserialize, Serialize};
use slint::{ComponentHandle, Model, ModelRc, SharedString, VecModel};
use std::{
    rc::Rc,
    sync::{Arc, Mutex},
};

use crate::encrypt::encryt::CustomEncryption;
mod encrypt;

slint::include_modules!();

pub struct CredsState {
    pub has_been_edited: bool,
    pub encrypter: Mutex<CustomEncryption>,
    pub load_state: Mutex<AppLoadState>,
    pub clipboard: Mutex<Option<Clipboard>>,
    pub clipboard_data: Mutex<Option<String>>,
}

#[derive(Serialize, Deserialize)]
pub struct CredsStructDTO {
    pub id: String,
    pub name: String,
    pub password: String,
    pub email_username: String,
    pub website_url: String,
}

impl From<&CredsStruct> for CredsStructDTO {
    fn from(value: &CredsStruct) -> Self {
        Self {
            id: value.id.clone().into(),
            name: value.name.clone().into(),
            password: value.password.clone().into(),
            email_username: value.email_username.clone().into(),
            website_url: value.website_url.clone().into(),
        }
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let load_state = AppLoadState::NotSaved;
    let old_encyption = CustomEncryption::default();

    // Business Atomic States
    let app_state = CredsState {
        has_been_edited: false,
        encrypter: Mutex::new(old_encyption),
        load_state: Mutex::new(load_state),
        clipboard: Mutex::new(Clipboard::new().ok()),
        clipboard_data: Mutex::new(None),
    };
    let shared_state = Arc::new(app_state);

    // UI HANDLES
    let ui = AppWindow::new()?;

    let creds_modal = Rc::new(VecModel::from(Vec::<CredsStruct>::new()));
    ui.global::<UIGlobal>()
        .set_creds(ModelRc::from(creds_modal.clone()));

    ui.global::<UIGlobal>().invoke_load();

    {
        ui.global::<UIGlobal>().on_save({
            let cloned = shared_state.clone();
            let ui_weak = ui.as_weak();
            // Save (Clicked) -> Encrypt -> Save to disk
            move || {
                let ui_handle = match ui_weak.upgrade() {
                    None => return,
                    Some(ui) => ui,
                };
                let data = ui_handle.global::<UIGlobal>().get_creds();
                let creds: Vec<CredsStructDTO> =
                    data.iter().map(|f| CredsStructDTO::from(&f)).collect();

                if creds.len() == 0 {
                    return;
                }

                let serialized = match serde_json::to_vec(&creds) {
                    Err(_e) => {
                        eprintln!("Failed to serialize {}", _e);
                        return;
                    }
                    Ok(val) => val,
                };

                let encrypter = {
                    let mut enc = cloned
                        .encrypter
                        .lock()
                        .expect("Failed to get lock on encrypter");
                    enc.encrypt(serialized.as_slice()); // As Slice of Bytes
                    enc
                };

                let mut load_state = cloned.load_state.lock().unwrap();
                match *load_state {
                    AppLoadState::NotSaved => {
                        encrypter.p_save_key();
                        encrypter.p_save_data();
                        *load_state = AppLoadState::Saved
                    }
                    AppLoadState::Saved => {
                        // Skip
                    }
                    AppLoadState::Update => {
                        encrypter.p_save_data();
                        *load_state = AppLoadState::Saved
                    }
                    AppLoadState::Update_Key => {
                        encrypter.p_save_key();
                        encrypter.p_save_data();
                        *load_state = AppLoadState::Saved
                    }
                }
            }
        });
    }
    {
        ui.global::<UIGlobal>().on_load({
            let cloned_app_state = Arc::clone(&shared_state);
            let creds_model_clone = creds_modal.clone();
            let ui_clone = ui.as_weak();
            // OldValult -> Encrypt -> Save -> Load -> Decrypt -> Display on UI -> Update Global State
            move || {
                let ui_handle = match ui_clone.upgrade() {
                    None => return,
                    Some(val) => val,
                };
                ui_handle.global::<UIGlobal>().invoke_save();

                let new_encrypter = CustomEncryption::read()
                    .map(|mut encrypter| {
                        encrypter.decrypt();
                        *cloned_app_state.load_state.lock().unwrap() = AppLoadState::Saved;
                        encrypter
                    })
                    .unwrap_or_default();

                let mut old_encryptor = cloned_app_state.encrypter.lock().unwrap();
                *old_encryptor = new_encrypter;

                if let Some(decrypted) = &old_encryptor.decrypted {
                    let slint_creds: Vec<CredsStruct> = decrypted
                        .iter()
                        .map(|f| CredsStruct {
                            email_username: f.email_username.clone().into(),
                            id: random_id(10).into(),
                            name: f.name.clone().into(),
                            password: f.password.clone().into(),
                            website_url: f.website_url.clone().into(),
                        })
                        .collect();
                    creds_model_clone.set_vec(slint_creds);
                }
            }
        });
    }

    {
        ui.global::<UIGlobal>().on_cb_copy({
            let cloned_app_state = Arc::clone(&shared_state);
            let ui_weak = ui.as_weak();
            move |id: SharedString| {
                println!("Id to copy password for : {id}");
                let ui_handle = match ui_weak.upgrade() {
                    None => return,
                    Some(val) => val,
                };
                let data = ui_handle.global::<UIGlobal>().get_creds();
                if let Some(creds) = data.iter().find(|v| v.id == id) {
                    println!("{}", creds.password);
                    // TODO Copy to clipboard here
                    if let Some(ref mut clipboard) = *cloned_app_state.clipboard.lock().unwrap() {
                        let mut data_lock = cloned_app_state.clipboard_data.lock().unwrap();
                        *data_lock = Some(creds.password.to_string().clone());
                        match clipboard.set_text(data_lock.as_ref().unwrap().clone()) {
                            Err(_e) => {
                                eprintln!("{}", _e);
                            }
                            Ok(()) => {
                                println!("Password copied!");
                            }
                        }
                    }
                } else {
                    println!("Password  not found");
                };
            }
        });
    }

    {
        ui.global::<UIGlobal>().on_add_new_entry({
            let creds_cloned = creds_modal.clone();
            let cloned = Arc::clone(&shared_state);
            move |entry| {
                println!("{entry:#?}");
                if entry.email_username.is_empty() && entry.password.is_empty() {
                    return;
                }
                let mut app_state = cloned.load_state.lock().unwrap();
                match *app_state {
                    AppLoadState::NotSaved => {
                        *app_state = AppLoadState::Update_Key;
                    }
                    AppLoadState::Update => {}
                    AppLoadState::Update_Key => {}
                    AppLoadState::Saved => {
                        *app_state = AppLoadState::Update;
                    }
                }
                let c2 = creds_cloned.clone();
                let _ = slint::spawn_local(async move {
                    c2.push(entry);
                });
            }
        });
    }

    {
        ui.global::<UIGlobal>().on_new_vault({
            let cloned_app_state = Arc::clone(&shared_state);
            let creds_model_clone = creds_modal.clone();
            let ui_clone = ui.as_weak();

            move || {
                if let Some(ui_window) = ui_clone.upgrade() {
                    // Invoke Save Callback
                    ui_window.global::<UIGlobal>().invoke_save();
                    // Creating a In-Memory Vault
                    let new_encrypter_state = CustomEncryption::default();
                    creds_model_clone.clear();
                    *cloned_app_state.load_state.lock().unwrap() = AppLoadState::NotSaved;

                    let mut encrypter = cloned_app_state.encrypter.lock().unwrap();
                    *encrypter = new_encrypter_state;
                }
            }
        });
    }

    ui.run().expect("failed to run slint ui window");
    Ok(())
}
