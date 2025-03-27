import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class ArgonService {
  /**
   * Hashes a plain text password using Argon2
   *
   * @param password The plain text password to hash
   * @returns A Promise resolving to the Argon2 hashed password
   */
  async hash(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  /**
   * Verifies a password against its stored hash
   *
   * @param hash The previously generated argon2 hash
   * @param password The plain text password to verify
   * @returns A boolean indicating whether the password matches the hash
   */
  async verify(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
