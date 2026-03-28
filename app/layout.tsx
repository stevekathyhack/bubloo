import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { BublooProvider } from "@/components/BublooProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Bubloo",
  description: "A calm care logging and caregiver handoff app for newborn parents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BublooProvider>
          <Suspense
            fallback={
              <main className="mx-auto flex min-h-screen w-full max-w-[430px] items-center px-4 py-8">
                <div className="surface-card card-padding stack-tight text-center">
                  <span className="eyebrow">Bubloo</span>
                  <h1 className="summary-headline">Pulling together the latest notes.</h1>
                  <p className="card-text">A calm handoff is on the way.</p>
                </div>
              </main>
            }
          >
            {children}
          </Suspense>
        </BublooProvider>
      </body>
    </html>
  );
}
