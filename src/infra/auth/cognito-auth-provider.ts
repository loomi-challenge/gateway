import { IAuthProvider } from "../../application/interfaces/auth-provider";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

let client: jwksClient.JwksClient | null = null;

function getClient() {
  if (!client) {
    const { COGNITO_REGION, COGNITO_USER_POOL_ID } = process.env;
    if (!COGNITO_REGION || !COGNITO_USER_POOL_ID) {
      throw new Error(
        "Missing required environment variables: COGNITO_REGION and COGNITO_USER_POOL_ID"
      );
    }

    client = jwksClient({
      jwksUri: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
    });
  }

  return client;
}

function getKey(
  header: JwtHeader,
  callback: (err: Error | null, key?: string) => void
) {
  if (!header.kid) return callback(new Error("Missing 'kid' in token header"));

  try {
    const client = getClient();
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  } catch (error) {
    callback(error as Error);
  }
}

interface CognitoJwtPayload extends JwtPayload {
  sub: string;
  email?: string;
}

export class CognitoAuthProvider implements IAuthProvider {
  async verifyToken(token: string): Promise<{ id: string; email: string }> {
    const { COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } =
      process.env;

    if (!COGNITO_REGION || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) {
      throw new Error(
        "Missing required environment variables: COGNITO_REGION, COGNITO_USER_POOL_ID, and COGNITO_CLIENT_ID"
      );
    }

    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          algorithms: ["RS256"],
          issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
          audience: COGNITO_CLIENT_ID,
        },
        (err, decoded) => {
          if (err) return reject(new Error(`Token inválido: ${err.message}`));
          if (!decoded || typeof decoded === "string") {
            return reject(new Error("Token inválido: payload inválido"));
          }

          const payload = decoded as CognitoJwtPayload;
          if (!payload.sub)
            return reject(new Error("Token inválido: claim 'sub' ausente"));

          resolve({
            id: payload.sub,
            email: payload.email || "",
          });
        }
      );
    });
  }
}
