import { useEffect } from "react";

/**
 * Camada de proteção visual contra cópia/download de imagens.
 * IMPORTANTE: nenhuma proteção client-side é 100% à prova de usuários
 * avançados (DevTools, screenshots, cache do navegador). Esta camada
 * desencoraja o uso casual: bloqueia menu de contexto sobre imagens,
 * arrastar, salvar via atalhos comuns e seleção de mídia.
 */
export function ImageProtection() {
  useEffect(() => {
    const isImage = (el: EventTarget | null): el is HTMLElement => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.tagName === "IMG" || el.tagName === "PICTURE" || el.tagName === "VIDEO") return true;
      const style = window.getComputedStyle(el);
      return style.backgroundImage !== "none";
    };

    const onContextMenu = (e: MouseEvent) => {
      if (isImage(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === "IMG" || e.target.closest("img,picture"))) {
        e.preventDefault();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // Ctrl/Cmd+S (salvar página), Ctrl+U (ver código), PrintScreen
      if ((e.ctrlKey || e.metaKey) && (k === "s" || k === "u")) {
        e.preventDefault();
      }
      if (k === "printscreen") {
        try {
          navigator.clipboard.writeText("");
        } catch {}
      }
    };
    const onCopy = (e: ClipboardEvent) => {
      const sel = window.getSelection();
      if (sel && sel.toString().length === 0) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("copy", onCopy);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("copy", onCopy);
    };
  }, []);

  return null;
}
