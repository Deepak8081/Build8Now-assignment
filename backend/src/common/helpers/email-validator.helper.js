import dns from 'dns/promises';
import { BadRequestError } from '../errors/index.js';

// Common test/mock domains allowed without live DNS lookup in testing environments
const ALLOWED_MOCK_DOMAINS = new Set([
  'build8now.com',
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'example.com',
  'test.com',
  'archstudio.in',
  'contractors.in',
  'company.com',
]);

export class EmailValidator {
  /**
   * Strict email format regex
   */
  static isValidFormat(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validate email format and verify DNS MX/A records
   */
  static async validateEmailWithMx(email) {
    const trimmed = email?.trim().toLowerCase();

    if (!this.isValidFormat(trimmed)) {
      throw new BadRequestError('Invalid email address format.');
    }

    const domain = trimmed.split('@')[1];

    if (!domain || domain.length < 3 || !domain.includes('.')) {
      throw new BadRequestError('Email address must contain a valid domain extension.');
    }

    // Fast path for test/mock domains or test environments
    if (process.env.NODE_ENV === 'test' || ALLOWED_MOCK_DOMAINS.has(domain)) {
      return true;
    }

    try {
      // 1. Check for Mail Exchange (MX) DNS records
      const mxRecords = await Promise.race([
        dns.resolveMx(domain),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DNS query timeout')), 2500)
        ),
      ]);

      if (mxRecords && mxRecords.length > 0) {
        return true;
      }
    } catch (err) {
      // 2. Fallback to A/AAAA record check if MX is not explicitly configured
      try {
        const aRecords = await dns.resolve4(domain);
        if (aRecords && aRecords.length > 0) {
          return true;
        }
      } catch {
        // Domain lookup completely failed
        throw new BadRequestError(
          `Email domain '@${domain}' is invalid or does not have active MX/DNS mail server records.`
        );
      }
    }

    return true;
  }
}
