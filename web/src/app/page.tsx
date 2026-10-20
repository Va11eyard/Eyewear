import { Hero } from "@/components/landing/hero";
import { Catalogue, ColourTeaser } from "@/components/landing/catalogue";
import { Method } from "@/components/landing/method";
import { Outlets, Privacy } from "@/components/landing/outlet";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Rule } from "@/components/ui/rule";

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="content">
        <Hero />
        <Rule />
        <Method />
        <Catalogue />
        <ColourTeaser />
        <Outlets />
        <Privacy />
      </main>
      <SiteFooter />
    </div>
  );
}
