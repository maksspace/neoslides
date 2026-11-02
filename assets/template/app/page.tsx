import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { product, ui } from "@/lib/story";

// Start screen: the presenter picks where to begin.
export default function Home() {
  return (
    <main className="dark flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 text-center text-foreground">
      <span className="grid size-16 place-items-center rounded-2xl bg-foreground font-mono text-3xl font-bold text-background">{product.mark}</span>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
        <p className="text-muted-foreground">{product.tagline}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/intro" className={buttonVariants({ size: "lg" })}>{ui.startDeck} →</Link>
        <Link href="/product" className={buttonVariants({ size: "lg", variant: "outline" })}>{ui.openProduct}</Link>
      </div>
      <p className="text-xs text-muted-foreground">{ui.prototype}</p>
      <Link href="/effects" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">{ui.effects}</Link>
    </main>
  );
}
