use std::collections::HashMap;
use tokio::process::Child;
use tokio::sync::Mutex;

pub struct ProcessManager {
    processes: Mutex<HashMap<String, Child>>,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }

    pub async fn add(&self, session_id: String, child: Child) {
        let mut procs = self.processes.lock().await;
        procs.insert(session_id, child);
    }

    pub async fn remove(&self, session_id: &str) -> Option<Child> {
        let mut procs = self.processes.lock().await;
        procs.remove(session_id)
    }

    pub async fn is_alive(&self, session_id: &str) -> bool {
        let mut procs = self.processes.lock().await;
        if let Some(child) = procs.get_mut(session_id) {
            match child.try_wait() {
                Ok(None) => true,   // Still running
                Ok(Some(_)) => false, // Exited
                Err(_) => false,
            }
        } else {
            false
        }
    }

    pub async fn kill(&self, session_id: &str) -> Result<(), String> {
        if let Some(mut child) = self.remove(session_id).await {
            child.kill().await.map_err(|e| format!("Kill failed: {}", e))
        } else {
            Err("Session not found".to_string())
        }
    }

    pub async fn active_count(&self) -> usize {
        let procs = self.processes.lock().await;
        procs.len()
    }
}
