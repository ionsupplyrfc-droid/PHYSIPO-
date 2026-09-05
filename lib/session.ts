import crypto from "crypto";
import { SessionUser } from "./types";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET が設定されていません。Vercelの環境変数を確認してください。");
  }
  return secret;
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

export function signSession(user: SessionUser): string {
  const payload = JSON.stringify({ ...user, iat: Date.now() });
  const payloadB64 = base64url(Buffer.from(payload, "utf8"));
  const signature = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
  const signatureB64 = base64url(signature);
  return `${payloadB64}.${signatureB64}`;
}

export function verifySession(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signatureB64] = parts;

  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
  const expectedB64 = base64url(expectedSignature);

  const a = Buffer.from(signatureB64);
  const b = Buffer.from(expectedB64);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (
      typeof payload.userId === "number" &&
      typeof payload.name === "string" &&
      (payload.role === "player" || payload.role === "staff" || payload.role === "coach")
    ) {
      return { userId: payload.userId, name: payload.name, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}
