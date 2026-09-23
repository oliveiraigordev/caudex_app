import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Caudexia — rosa do deserto",
    short_name: "Caudexia",
    description:
      "Rega, adubação, clima e lembretes para o seu viveiro de Adenium.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f2ed",
    theme_color: "#c45c4a",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
