#![allow(dead_code, unused_variables)]

use slint::{Color, ComponentHandle, ModelRc, SharedString, VecModel};
use std::{
    collections::HashMap,
    sync::{Arc, RwLock, mpsc},
    thread::{self},
    vec,
};

slint::include_modules!();
enum AppCommands {
    Save,
    Update(CredsStruct),
    Insert(CredsStruct),
}

pub struct CredsState {
    pub data: RwLock<HashMap<String, CredsStruct>>,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let loaded_from_json: Vec<CredsStruct> = vec![
        CredsStruct {
            id: "discord".into(),
            name: "Discord".into(),
            password: "discordpassword".into(),
            email_username: "".into(),
            website_url: "discord.com".into(),
        },
        CredsStruct {
            id: "google".into(),
            name: "Google".into(),
            password: "googlepassword".into(),
            email_username: "".into(),
            website_url: "gmail.com".into(),
        },
        CredsStruct {
            id: "netflix".into(),
            name: "Netflix".into(),
            password: "NetflixPassword".into(),
            email_username: "".into(),
            website_url: "netflix.com".into(),
        },
    ];

    let hashed: HashMap<String, CredsStruct> = loaded_from_json
        .iter()
        .map(|v| (v.id.to_string(), v.clone()))
        .collect();
    let arw_hash_map = RwLock::new(hashed);

    // Atomic States
    let app_state = CredsState { data: arw_hash_map };
    let shared_state = Arc::new(app_state);
    let state_for_channel = generate_mutex_clone(&shared_state);
    let state_for_savecb = generate_mutex_clone(&shared_state);

    // UI HANDLES
    let ui = AppWindow::new()?;
    let ui_weak_thread = ui.as_weak();
    let cloned_ui_thread = ui_weak_thread.clone();

    // Update channel for UI
    let (update_tx_channel, update_rx_channel) = mpsc::channel::<AppCommands>();
    let channel_add_entry_clone = update_tx_channel.clone();

    thread::spawn(move || {
        loop {
            if let Some(appcommands) = update_rx_channel.recv().ok() {
                let mut m_state = state_for_channel.data.write().unwrap();
                match appcommands {
                    AppCommands::Save => {
                        //  TODO  >> Disk Saving Logic here OR maybe on network
                    }
                    AppCommands::Insert(creds) => {
                        let _ = m_state.insert(creds.id.to_string(), creds.clone());

                        let vec_state: Vec<CredsStruct> =
                            m_state.iter().map(|v| v.1.clone()).collect();
                        let c2 = cloned_ui_thread.clone();
                        slint::invoke_from_event_loop(move || {
                            if let Some(upgraded_ui) = c2.upgrade() {
                                println!("Setting new UI State");
                                upgraded_ui
                                    .global::<UIGlobal>()
                                    .set_creds(ModelRc::new(VecModel::from(vec_state)));
                                upgraded_ui.set_r_color(Color::from_argb_encoded(323));
                            }
                        })
                        .unwrap();
                    }
                    AppCommands::Update(newcreds) => {
                        // TODO >> Update the current entry of the credentials
                    }
                }
            };
        }
    });

    ui.global::<UIGlobal>().on_save(move || {
        let _ = update_tx_channel.send(AppCommands::Save);
    });

    ui.global::<UIGlobal>().on_cb_copy(move |id: SharedString| {
        let cloned = shared_state.clone();
        println!("Id to copy password for : {id}");
        let unlocked = cloned.data.read().unwrap();

        if let Some(item) = unlocked.get(id.as_str()) {
            println!(
                "Service Name : {} \nService Password: {}",
                item.name, item.password
            )
        }
    });

    ui.global::<UIGlobal>().on_add_new_entry(move |entry| {
        println!("{entry:#?}");
        let state = state_for_savecb
            .data
            .read()
            .expect("Failed to lock the ARC");
        channel_add_entry_clone
            .send(AppCommands::Insert(entry))
            .expect("Channel is closed!");
    });

    // ui.set_items(ModelRc::new(VecModel::from(loaded_from_json)));
    let _ = ui.run();
    Ok(())
}

fn generate_mutex_clone<T>(data: &Arc<T>) -> Arc<T> {
    Arc::clone(data)
}
