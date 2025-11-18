import { seedDuas } from "./seed-duas";

seedDuas()
  .then(() => {
    console.log("Duas seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed duas:", error);
    process.exit(1);
  });
