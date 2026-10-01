import { create } from "zustand";
import type { AIPanelPlugin } from "../lib/types";
import { initialPlugins } from "../lib/plugins";

interface PluginState {
  plugins: AIPanelPlugin[];
  togglePlugin: (pluginId: string) => void;
  installPlugin: (pluginId: string) => void;
  uninstallPlugin: (pluginId: string) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  plugins: initialPlugins,

  togglePlugin: (pluginId) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === pluginId ? { ...p, enabled: !p.enabled } : p
      ),
    })),

  installPlugin: (pluginId) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === pluginId ? { ...p, installed: true, enabled: true } : p
      ),
    })),

  uninstallPlugin: (pluginId) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === pluginId ? { ...p, installed: false, enabled: false } : p
      ),
    })),
}));
