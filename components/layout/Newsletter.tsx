import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="bg-linear-to-br from-primary/5 to-accent/5 py-16 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
          Stay in the Loop
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Subscribe to receive updates about our progress, new features, and how
          we're transforming healthcare referrals in Kenya.
        </p>

        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="your.email@example.com"
            className="bg-background border border-border focus-visible:ring-primary rounded px-4 py-2"
            required
          />

          <Button
            type="submit"
            className="bg-primary text-primary-foreground
            "
          >
            Subscribe
            <ArrowRight
              className="ml-2 h-4 w-4 sm:h-5 sm:w-5 
                         transition-transform duration-200 
                         group-hover:translate-x-1"
            />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4">
          We respect your privacy. You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
