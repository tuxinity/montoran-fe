import { Suspense } from "react";
import { ContactClient } from "./contact-client";

export default function Contact() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactClient />
    </Suspense>
  );
}
