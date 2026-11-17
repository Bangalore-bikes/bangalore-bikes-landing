import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { communityLinks } from "../src/lib/community.ts";

for (const [name, invite] of [
  ["whatsapp-invite", communityLinks.whatsapp],
  ["whatsapp-short-invite", communityLinks.whatsappShort],
]) {
  const options = {
    width: 320,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#000000ff", light: "#ffffffff" },
  };
  await QRCode.toFile(
    fileURLToPath(new URL("../public/" + name + ".png", import.meta.url)),
    invite,
    options,
  );
  await writeFile(
    new URL("../public/" + name + ".svg", import.meta.url),
    await QRCode.toString(invite, { ...options, type: "svg" }),
  );
  console.log("Generated " + name + " for " + invite);
}
