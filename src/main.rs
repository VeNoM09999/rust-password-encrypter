// #![allow(dead_code, unused_variables)]
use serde::{Deserialize, Serialize};
use slint::{ComponentHandle, Model, ModelRc, SharedString, VecModel};
use std::{
    fs::{File, exists},
    io::Write,
    rc::Rc,
    sync::{Arc, Mutex},
};

use crate::encrypt::encryt::CustomEncryption;
mod encrypt;

slint::include_modules!();

pub struct CredsState {
    // pub data: Mutex<HashMap<String, CredsStruct>>,
    pub has_been_edited: bool,
    pub encrypter: Mutex<CustomEncryption>,
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
    let encryption = CustomEncryption::read();

    // Business Atomic States
    let app_state = CredsState {
        has_been_edited: false,
        encrypter: Mutex::new(encryption),
    };
    let shared_state = Arc::new(app_state);

    // UI HANDLES
    let ui = AppWindow::new()?;

    let creds_modal = Rc::new(VecModel::from(Vec::<CredsStruct>::new()));
    ui.global::<UIGlobal>()
        .set_creds(ModelRc::from(creds_modal.clone()));

    {
        ui.global::<UIGlobal>().on_save({
            let cloned = shared_state.clone();
            let ui_weak = ui.as_weak();
            move || {
                if let Some(ui_strong) = ui_weak.upgrade() {
                    let data = ui_strong.global::<UIGlobal>().get_creds();

                    let creds: Vec<CredsStructDTO> =
                        data.iter().map(|f| CredsStructDTO::from(&f)).collect();

                    let serialized = serde_json::to_vec(&creds).unwrap();
                    let encrypted_bytes = cloned
                        .encrypter
                        .lock()
                        .expect("Failed to acquire lock on encryptor")
                        .encrypt(serialized.as_slice()); // As Slice of Bytes
                    if std::path::Path::new("data.enc").is_file() {
                        let mut file_handle =
                            File::open("data.enc").expect("Failed to find the encrypted_file");
                        file_handle.write_all(&encrypted_bytes);
                        file_handle.flush();
                    } else {
                        let mut file_handle =
                            File::create("data.enc").expect("failed to create file in fs");
                        file_handle.write_all(&encrypted_bytes);
                        file_handle.flush();
                    }
                }
            }
        });
    }
    {
        ui.global::<UIGlobal>().on_load({
            let cloned_app_state = Arc::clone(&shared_state);
            let creds_model_clone = creds_modal.clone();
            move || {
                if let Ok(_) = exists("data.enc") {
                    let mut new_encrypter = CustomEncryption::read();
                    new_encrypter.decrypt();
                    let mut old_encryptor = cloned_app_state.encrypter.lock().unwrap();
                    *old_encryptor = new_encrypter;

                    if let Some(decrypted) = &old_encryptor.decrypted {
                        let slint_creds: Vec<CredsStruct> = decrypted
                            .iter()
                            .map(|f| CredsStruct {
                                email_username: f.email_username.clone().into(),
                                id: f.id.clone().into(),
                                name: f.name.clone().into(),
                                password: f.password.clone().into(),
                                website_url: f.website_url.clone().into(),
                            })
                            .collect();
                        creds_model_clone.set_vec(slint_creds);
                    }
                }
            }
        });
    }

    {
        ui.global::<UIGlobal>().on_cb_copy({
            let cloned = Arc::clone(&shared_state);
            move |id: SharedString| {
                println!("Id to copy password for : {id}");
            }
        });
    }

    {
        ui.global::<UIGlobal>().on_add_new_entry({
            let creds_cloned = creds_modal.clone();
            // let cloned = Arc::clone(&shared_state);
            move |entry| {
                // let ui_handle = ui_handle.clone();
                println!("{entry:#?}");
                if entry.email_username.is_empty() && entry.password.is_empty() {
                    return;
                }
                let c2 = creds_cloned.clone();
                let _ = slint::spawn_local(async move {
                    c2.push(entry);
                });
            }
        });
    }

    ui.run().expect("failed to run slint ui window");
    Ok(())
}
