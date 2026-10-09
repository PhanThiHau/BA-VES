import { useState } from "react";

interface PhotoProps {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

export function Photo({ src, alt, ratio = "aspect-[4/3]", className = "", imgClassName = "", eager = false }: PhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`overflow-hidden ${ratio} ${className}`} role={alt ? undefined : "presentation"}>
      {failed ? (
        <div className="flex h-full w-full items-end bg-gradient-to-br from-navy via-navy-deep to-navy-deep p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-mist/70">BA-VES</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}
    </div>
  );
}