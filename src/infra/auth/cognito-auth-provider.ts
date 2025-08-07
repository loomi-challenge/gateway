import { IAuthProvider } from "../../application/interfaces/auth-provider";
import jwt, { JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
});

function getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void) {
  if (!header.kid) return callback(new Error("Missing 'kid' in token header"));

  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export class CognitoAuthProvider implements IAuthProvider {
  async verifyToken(token: string): Promise<{ id: string; email: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          algorithms: ["RS256"],
          issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
          audience: process.env.COGNITO_CLIENT_ID,
        },
        (err, decoded: any) => {
          if (err) return reject(err);
          resolve({
            id: decoded.sub,
            email: decoded.email,
          });
        }
      );
    });
  }
}
