import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD as string,
  super_admin_phone: process.env.SUPER_ADMIN_PHONE as string,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  DO_SPACES_ENDPOINT: process.env.DO_SPACE_ENDPOINT,
  DO_ACCESS_KEY_ID: process.env.DO_SPACE_ACCESS_KEY,
  DO_SECRET_ACCESS_KEY: process.env.DO_SPACE_SECRET_KEY,
  DO_SPACES_BUCKET: process.env.DO_SPACE_BUCKET,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,

  sender_email: process.env.SENDER_EMAIL as string,
  sender_pass: process.env.SENDER_PASS as string,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },

  BOLD_API_URL:process.env.BOLD_API_URL as string,
  BOLD_API_KEY:process.env.BOLD_API_KEY as string,
};
