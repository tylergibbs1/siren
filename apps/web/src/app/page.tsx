import Link from "next/link";
import { Playground } from "@/components/playground";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border shrink-0">
        <div className="h-12 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-balance">Siren</h1>
            <span className="text-[10px] text-muted-foreground bg-scale-3 px-2 py-0.5 rounded-full font-medium">
              json-native
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground transition-[color]"
            >
              Docs
            </Link>
            <a
              href="https://github.com/siren-diagram/siren"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-[color]"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="px-4 pb-4">
          <p className="max-w-3xl text-sm text-muted-foreground text-balance">
            Better Mermaid through typed JSON. Write a Siren document, validate it,
            and render an interactive diagram with sane defaults.
          </p>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <Playground />
      </main>
    </div>
  );
}
