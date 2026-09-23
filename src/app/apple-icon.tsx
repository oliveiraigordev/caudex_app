import { ImageResponse } from "next/og";
import { adeniumFlowerOg } from "@/lib/adenium-flower-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 25%, #f7ebe3 0%, #e8d4c8 35%, #c9a99a 100%)",
        }}
      >
        {adeniumFlowerOg(120)}
      </div>
    ),
    { ...size },
  );
}
