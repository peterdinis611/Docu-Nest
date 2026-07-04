"use client"

import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { cn } from "@/lib/utils"

interface ImageViewerProps {
  src: string
  alt: string
  className?: string
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.12 }}
        doubleClick={{ mode: "reset" }}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full flex justify-center"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[min(78vh,900px)] max-w-full rounded-lg border bg-background object-contain shadow-sm"
            draggable={false}
          />
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
