import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

export const SETUP_PASSWORD_TOKEN_TYPE = 'setup-password';

/** Signs a short-lived setup-password token and builds the frontend URL that consumes it. */
export async function buildSetupPasswordUrl(input: {
  userId: string;
  expiresIn: JwtSignOptions['expiresIn'];
  jwt: JwtService;
  config: ConfigService;
}): Promise<string> {
  const token = await input.jwt.signAsync(
    { sub: input.userId, type: SETUP_PASSWORD_TOKEN_TYPE },
    {
      secret: input.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: input.expiresIn,
    },
  );
  return `${input.config.get('CORS_ORIGIN', 'http://localhost:3001')}/setup-password?token=${token}`;
}
