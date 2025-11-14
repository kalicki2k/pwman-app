use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_shell::{ShellExt};
use tauri_plugin_shell::process::CommandEvent;
use tokio::time::sleep;
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
          let _ = app_handle.emit("sync://stdout", String::from_utf8_lossy(&bytes).to_string());
        }
        CommandEvent::Stderr(bytes) => {
          let _ = app_handle.emit("sync://stderr", String::from_utf8_lossy(&bytes).to_string());
        }
        CommandEvent::Terminated(t) => {
          let _ = app_handle.emit("sync://terminated", t.code);
        }
        _ => {}
      }
    }
  });

  *state.child.lock().unwrap() = Some(child);

  let started = wait_for_health(&addr, 2000).await;
  if !started {
    let mut guard = state.child.lock().unwrap();
    if let Some(ch) = guard.take() {
      let _ = ch.kill();
    }
    return Err("Sync server failed to start (timeout)".into());
  }

  app.emit("sync://ready", &addr).ok();
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

async fn wait_for_health(addr: &str, timeout_ms: u64) -> bool {
  let url = format!("http://{}/health", addr);
  let deadline = Instant::now() + Duration::from_millis(timeout_ms);

  loop {
    if Instant::now() > deadline {
      return false;
    }
    match reqwest::get(&url).await {
      Ok(res) if res.status().is_success() => return true,
      _ => sleep(Duration::from_millis(120)).await,
    }
  }
}
