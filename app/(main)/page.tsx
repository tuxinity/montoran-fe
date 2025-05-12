import { Suspense } from "react";
import { HomeClient } from "./home-client";
import CarApi from "@/lib/car-api";
import type { Car } from "@/types/car";

export const revalidate = 10;

const Home = async () => {
  // Fetch cars on the server using a try-catch to handle potential errors
  let initialCars: Car[] = [];
  try {
    initialCars = await CarApi.getCars({});
  } catch (error) {
    console.error("Error fetching initial cars:", error);
    // Continue with empty array if there's an error
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeClient initialCars={initialCars} />
    </Suspense>
  );
};

export default Home;
