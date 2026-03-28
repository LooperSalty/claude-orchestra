import { AppShell } from './components/layout/AppShell';
import { useKeyboard } from './hooks/useKeyboard';

export function App() {
  useKeyboard();

  return <AppShell />;
}
