import { CaptureStudio } from "@/components/capture-studio";
import { SiteHeader } from "@/components/site-header";

export default function CapturePage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="content">
        <CaptureStudio />
      </main>
    </div>
  );
}
