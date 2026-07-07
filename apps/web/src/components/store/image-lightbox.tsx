"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { imageSrc } from "@/lib/api";
import { Overlay } from "@/components/ui/overlay";

// Full-screen image view: swipe between a product's photos, Escape or
// backdrop click to dismiss. Built on the shared Overlay primitive.
export function ImageLightbox({
  images,
  startIndex = 0,
  onClose,
}: {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, startIndex });
  const [selected, setSelected] = useState(startIndex);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <Overlay
      onClose={onClose}
      contentClassName="flex max-h-[90vh] w-full max-w-3xl flex-col"
    >
      <div className="flex justify-end pb-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-surface/90 px-3 py-1.5 text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Close
        </button>
      </div>

      <div ref={emblaRef} className="overflow-hidden rounded-[10px]">
        <div className="flex">
          {images.map((url, index) => {
            const src = imageSrc(url);
            return (
              <div key={url + index} className="min-w-0 flex-[0_0_100%]">
                {src && (
                  <Image
                    src={src}
                    alt=""
                    width={1200}
                    height={900}
                    unoptimized
                    className="max-h-[75vh] w-full object-contain"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-3">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 w-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                i === selected ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </Overlay>
  );
}
