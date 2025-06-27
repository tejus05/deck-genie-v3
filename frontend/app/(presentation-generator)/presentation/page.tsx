'use client'
import React from "react";
import { FooterProvider } from "../context/footerContext";
import PresentationPage from "./components/PresentationPage";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
const page = () => {

  const router = useRouter();
  const params = useSearchParams();
  const queryId = params.get("id");
  if (!queryId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-accent/5"></div>
        <div className="relative text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-display text-gradient">Presentation Not Found</h1>
            <p className="text-muted-foreground font-body text-lg">The presentation ID you're looking for doesn't exist or has been removed.</p>
          </div>
          <Button 
            onClick={() => router.push("/dashboard")}
            size="lg"
            className="shadow-modern-xl hover:shadow-modern-xl hover:scale-[1.02] transition-all duration-300"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  return (
    <FooterProvider>
      <PresentationPage presentation_id={queryId} />
    </FooterProvider>
  );
};
export default page;
