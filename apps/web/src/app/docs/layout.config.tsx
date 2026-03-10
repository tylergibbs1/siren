import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Link from "next/link";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <Link href="/" className="flex items-center gap-2">
        <span className="font-semibold text-[15px] tracking-tight">Siren</span>
        <span className="text-[10px] text-fd-muted-foreground bg-fd-secondary px-1.5 py-0.5 rounded-full font-medium">
          docs
        </span>
      </Link>
    ),
  },
  links: [
    {
      text: "Playground",
      url: "/",
    },
    {
      text: "GitHub",
      url: "https://github.com/siren-diagram/siren",
      external: true,
    },
  ],
};
