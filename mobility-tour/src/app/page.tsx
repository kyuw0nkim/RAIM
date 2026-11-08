import { TourApp } from "@/components/visitor/TourApp";
import { ServiceWorkerRegistrar } from "@/components/visitor/ServiceWorker";

export default function Home() {
  return (
    <>
      <ServiceWorkerRegistrar />
      <TourApp />
    </>
  );
}
