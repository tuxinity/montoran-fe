import { Suspense } from "react";
import { AboutClient } from "./about-client";

export default function About() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutClient />
    </Suspense>
  );
}
