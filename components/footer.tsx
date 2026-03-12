import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-primary">Pro</span>
              <span className="text-foreground">Clean</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            Professional, reliable home cleaning services — book in 60 seconds.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
          <span className="hidden md:inline text-border">|</span>
          <p>© {new Date().getFullYear()} ProClean</p>
        </div>
      </div>
    </footer>
  );
}
