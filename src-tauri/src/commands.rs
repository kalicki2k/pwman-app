use tauri::{AppHandle, Emitter, State};
use tauri_plugin_shell::{ShellExt};
use tauri_plugin_shell::process::CommandEvent;
use crate::state::SyncState;

#[tauri::command]
pub async fn start_sync(
  app: AppHandle,
  state: State<'_, SyncState>,
  addr: String,
  base_dir: String,
) -> Result<(), String> {
  {
    if state.child.lock().unwrap().is_some() {
      return Ok(());
    }
  }

  let (mut rx, child) = app
    .shell()
    .sidecar("pwman-sync-server")
    .map_err(|e| e.to_string())?
    .args(["--addr", &addr, "--base", &base_dir])
    .spawn()
    .map_err(|e| e.to_string())?;

  let app_handle = app.clone();
  tauri::async_runtime::spawn(async move {
    while let Some(event) = rx.recv().await {
      match event {
        CommandEvent::Stdout(bytes) => {
          let text = String::from_utf8_lossy(&bytes).to_string();
          let _ = app_handle.emit("sync://stdout", text);
        }
        CommandEvent::Stderr(bytes) => {
          let text = String::from_utf8_lossy(&bytes).to_string();
          let _ = app_handle.emit("sync://stderr", text);
        }
        CommandEvent::Terminated(t) => {
          let _ = app_handle.emit("sync://terminated", t.code);
        }
        _ => {}
      }
    }
  });

  *state.child.lock().unwrap() = Some(child);
  Ok(())
}

#[tauri::command]
pub async fn stop_sync(state: State<'_, SyncState>) -> Result<(), String> {
  let mut guard = state.child.lock().unwrap();
  if let Some(child) = guard.take() {
    child.kill().map_err(|e| e.to_string())?;
  }
  *guard = None;
  Ok(())
}
