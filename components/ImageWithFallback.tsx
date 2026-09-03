"use client";

import { Ref, useState } from "react";

const FALLBACK_SRC = "/images/fallback.svg";

/**
 * Imagem que nunca "quebra": mostra skeleton enquanto carrega e,
 * se o arquivo falhar, troca para um placeholder local do app.
 * Também exibe a foto de verdade caso o caminho seja local.
 */
export default function ImageWithFallback({
  src,
  alt,
  className = "",
  imgClassName = "",
  eager = false,
  imgRef,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  imgRef?: Ref<HTMLImageElement>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={failed || !src ? FALLBACK_SRC : src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClassName}`}
      />
    </div>
  );
}
