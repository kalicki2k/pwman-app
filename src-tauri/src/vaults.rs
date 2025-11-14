use serde::Serialize;
use std::{
  fs,
  path::{Path, PathBuf},
  time::SystemTime,
};
use tokio::task;

#[derive(Serialize, Clone, Debug)]
pub struct VaultInfo {
  pub path: String,
  pub file_name: String,
  pub size: u64,
  pub modified: Option<u64>,
  pub label: String,
}

fn default_vault_dir() -> PathBuf {
  dirs::config_dir()
    .unwrap_or_else(|| std::env::temp_dir())
    .join("pwman")
}

fn scan_vault_dir(dir: &Path) -> Vec<VaultInfo> {
  let mut out = Vec::new();
  if let Ok(rd) = fs::read_dir(dir) {
    for entry in rd.flatten() {
      let p = entry.path();
      if p.extension().and_then(|e| e.to_str()) != Some("json") {
        continue;
      }
      let file_name = p.file_name().and_then(|s| s.to_str()).unwrap_or_default().to_string();
      let label = file_name.strip_suffix(".json").unwrap_or(&file_name).to_string();

      let meta = fs::metadata(&p).ok();
      let size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
      let modified = meta
        .and_then(|m| m.modified().ok())
        .and_then(|t: SystemTime| t.duration_since(SystemTime::UNIX_EPOCH).ok())
        .map(|d| d.as_secs());

      out.push(VaultInfo { path: p.to_string_lossy().to_string(), file_name, size, modified, label });
    }
  }
  out.sort_by(|a, b| a.file_name.to_lowercase().cmp(&b.file_name.to_lowercase()));
  out
}

#[tauri::command]
pub async fn list_local_vaults(dir_hint: Option<String>) -> Result<Vec<VaultInfo>, String> {
  task::spawn_blocking(move || {
    let dir = dir_hint
      .map(|s| {
        if s.starts_with("~/") {
          dirs::home_dir().unwrap_or_default().join(&s[2..])
        } else {
          PathBuf::from(s)
        }
      })
      .unwrap_or_else(default_vault_dir);

    Ok::<_, String>(scan_vault_dir(&dir))
  })
    .await
    .map_err(|e| e.to_string())?
}
