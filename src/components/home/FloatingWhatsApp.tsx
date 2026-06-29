import { WHATSAPP_URL } from "@/lib/site-config";

export function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com Michele no WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-4 pr-5 py-3 text-sm font-medium shadow-2xl ring-1 ring-black/10 hover:bg-[#1ebe57] transition"
    >
      <span className="relative grid h-6 w-6 place-items-center">
        <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
        <svg viewBox="0 0 32 32" className="relative h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.27c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.14.18 1.91 2.91 4.62 4.08.65.28 1.15.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.01 4C9.39 4 4 9.39 4 16.01c0 2.12.56 4.19 1.62 6.01L4 28l6.16-1.61a11.94 11.94 0 0 0 5.84 1.5h.01C22.62 27.89 28 22.5 28 15.88 28 9.27 22.63 4 16.01 4z" />
        </svg>
      </span>
      <span>WhatsApp</span>
    </a>
  );
}
