import { ImageResponse } from "next/og";
import { usdRound } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wasteMinor = Number(searchParams.get("waste") ?? "869500");
    const score = Number(searchParams.get("score") ?? "87");
    const label = (searchParams.get("label") ?? "CLOUD WASTE DETECTED")
      .toUpperCase()
      .slice(0, 48);
    const resource = (searchParams.get("resource") ?? "30 verified leak signatures")
      .slice(0, 64);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            background:
              "radial-gradient(900px 500px at 80% 10%, rgba(61,220,132,0.16), transparent 60%), #060A08",
            color: "#EAF2EC",
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 28,
              letterSpacing: 6,
              color: "#3DDC84",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#3DDC84",
                boxShadow: "0 0 24px #3DDC84",
                display: "flex",
              }}
            />
            CLOUDTRIM AI // FINOPS WASTE RADAR
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 26, color: "#7E948A" }}>
              {label}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 120,
                fontWeight: 700,
                color: "#FF6B5E",
                lineHeight: 1,
              }}
            >
              {usdRound(Number.isFinite(wasteMinor) ? wasteMinor : 0)}/mo
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 28 }}>
              <div
                style={{
                  display: "flex",
                  padding: "10px 24px",
                  border: "2px solid rgba(61,220,132,0.5)",
                  borderRadius: 12,
                  color: "#3DDC84",
                }}
              >
                WASTESCORE {Number.isFinite(score) ? Math.round(score) : 0}/100
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "10px 24px",
                  border: "2px solid rgba(126,148,138,0.4)",
                  borderRadius: 12,
                  color: "#B9C9BF",
                }}
              >
                1-CLICK TERRAFORM FIX
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#7E948A",
            }}
          >
            <div style={{ display: "flex" }}>{resource}</div>
            <div style={{ display: "flex" }}>cloudtrim.ai</div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  } catch {
    return new Response("og render failed", { status: 500 });
  }
}
