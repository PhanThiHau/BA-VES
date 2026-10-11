export function VideoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="landing-video-modal baves-video-modal fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="landing-video-modal__dialog baves-video-modal__dialog relative w-full max-w-4xl overflow-hidden rounded-xl bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="landing-video-modal__header baves-video-modal__header flex items-center justify-between border-b border-white/10 px-5 py-3 text-white">
          <div className="landing-video-modal__title baves-video-modal__title flex items-center gap-2 font-medium">
            <i className="bi bi-play-circle text-blue-400"></i>
            <span>BA-VES Platform Walkthrough</span>
          </div>
          <button
            onClick={onClose}
            className="landing-video-modal__close baves-video-modal__close rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close modal"
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>
        <div className="landing-video-modal__body baves-video-modal__body relative aspect-video w-full bg-black">
          <iframe
            className="landing-video-modal__iframe baves-video-modal__iframe h-full w-full"
            src="https://www.youtube-nocookie.com/embed/Y7f98aduVJ8?autoplay=1"
            title="BA-VES Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// Aliases for compatibility
export { VideoModal as LandingVideoModal, VideoModal as ElevateDemoVideoModal };
