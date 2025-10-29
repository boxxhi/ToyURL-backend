import crypto from "node:crypto";

function randomString(length: number): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function createCode(url: string): string {
    const hashed = crypto
        .createHash("sha256")
        .update(url, "utf-8")
        .digest()
        .toString("hex")
        .slice(0, 3);

    const ts = Date.now().toString().slice(-3);
    const code = Buffer.from(
        `${ts}${hashed}${randomString(2)}`,
        "utf-8"
    ).toString("base64url");

    return code;
}

export function encodePassword(input: string): string {
  return crypto
        .createHash("sha256")
        .update(input, "utf-8")
        .digest()
        .toString("hex");
}

const PASSWORD = "ultrasecretpassword$67829425"

export function sign(input: string, password: string): string {
  return crypto
        .createHmac("sha256", PASSWORD + password)
        .update(input)
        .digest()
        .toString("hex")
}

function base64Encode(input: string) {
  return Buffer.from(input, 'utf-8').toString('base64')
}

export function createToken(email: string, password: string, isGoogle: boolean = false): string {
  const expire = Date.now() + 1800000
  let plain = `${email}|${expire}`

  if (isGoogle) plain += '|true'
  else plain += '|false'

  const encoded = base64Encode(plain)

  return base64Encode(encoded + '.' + sign(encoded, password))
}