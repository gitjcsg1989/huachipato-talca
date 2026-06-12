import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/client";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed text-white/70">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-8 text-2xl font-bold text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-6 text-xl font-bold text-white">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-brand pl-4 italic text-white/60">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-1 pl-6 text-white/70">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6 text-white/70">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-soft underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) =>
      value?.asset ? (
        <span className="relative my-6 block aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={urlFor(value).width(900).url()}
            alt={value.caption ?? ""}
            fill
            className="object-cover"
          />
        </span>
      ) : null,
  },
};

export function PortableContent({ value }: { value: unknown }) {
  if (!value) return null;
  return (
    <PortableText
      value={value as Parameters<typeof PortableText>[0]["value"]}
      components={components}
    />
  );
}
