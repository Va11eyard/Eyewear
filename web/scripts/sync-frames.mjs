import { copyFileSync } from "node:fs";

const from = new URL("../public/data/frames.json", import.meta.url);
const to = new URL("../../backend/internal/catalog/frames.json", import.meta.url);
copyFileSync(from, to);
console.log("synced frames.json into backend/internal/catalog");
