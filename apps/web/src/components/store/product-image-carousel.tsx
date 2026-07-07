"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { imageSrc } from "@/lib/api";

// The product card's image section. A single photo renders as a plain
// static image (today's exact look, no embla mounted — zero regression for
// the common case). Multiple photos get a swipeable carousel with dots.
// Clicking any image opens the full-screen lightbox via onImageClick.
export function ProductImageCarousel({
  images,
  onImageClick,
}: {
  images: string[];
  onImageClick?: (index: number) => void;
}) {
  const multi = images.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[10px] border border-line bg-brand-tint">
        <span className="text-xs text-brand-strong">Нет фото</span>
      </div>
    );
  }

  if (!multi) {
    const src = imageSrc(images[0]);
    return (
      <button
        type="button"
        onClick={() => onImageClick?.(0)}
        aria-label="Открыть фото целиком"
        className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[10px] border border-line bg-brand-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {src ? (
          <Image
            src={src}
            alt=""
            width={250}
            height={188}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-brand-strong">Нет фото</span>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <div
        ref={emblaRef}
        className="aspect-[4/3] overflow-hidden rounded-[10px] border border-line bg-brand-tint"
      >
        <div className="flex h-full">
          {images.map((url, index) => {
            const src = imageSrc(url);
            return (
              <button
                key={url + index}
                type="button"
                onClick={() => onImageClick?.(index)}
                aria-label={`Открыть фото ${index + 1} из ${images.length} на весь экран`}
                className="relative h-full min-w-0 flex-[0_0_100%] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {src && (
                  <Image
                    src={src}
                    alt=""
                    width={250}
                    height={188}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === selected ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
