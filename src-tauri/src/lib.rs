mod state;
mod sync;
mod vaults;

use state::SyncState;
use sync::{start_sync, stop_sync};
use tauri::Manager;
use vaults::list_local_vaults;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SyncState {
            child: std::sync::Mutex::new(None),
        })
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let state = window.state::<SyncState>();
                let mut guard = state.child.lock().unwrap();
                if let Some(child) = guard.take() {
                    let _ = child.kill();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![start_sync, stop_sync, list_local_vaults])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
