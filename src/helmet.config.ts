import { HelmetOptions } from 'helmet';

/* eslint-disable @typescript-eslint/quotes */
const isProduction = process.env.NODE_ENV === 'production';

const config: HelmetOptions = {
  // HTTP Strict Transport Security (HSTS)
  // Forces browsers to use HTTPS connections only
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Enable browser preload list inclusion
  },

  // Content Security Policy - configured for Stripe integration
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Only load resources from same origin
      styleSrc: ["'self'", "'unsafe-inline'"], // Styles from same origin + inline (for React/UI)
      scriptSrc: ["'self'", 'https://js.stripe.com'], // Scripts from same origin + Stripe.js
      imgSrc: ["'self'", 'data:', 'https:'], // Images from same origin, data URIs, and HTTPS
      connectSrc: ["'self'", 'https://api.stripe.com'], // API calls to same origin + Stripe API
      fontSrc: ["'self'"], // Fonts only from same origin
      objectSrc: ["'none'"], // No plugins (Flash, etc.)
      mediaSrc: ["'self'"], // Media only from same origin
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'], // Stripe Elements iframes
      frameAncestors: ["'none'"], // Prevent being embedded in iframes
      formAction: ["'self'"], // Forms can only submit to same origin
      baseUri: ["'self'"], // Restrict base tag URLs
      upgradeInsecureRequests: isProduction ? [] : null, // Force HTTPS in production
    },
  },

  // X-Frame-Options - Prevents clickjacking
  frameguard: {
    action: 'deny', // Deny all framing
  },

  // X-Content-Type-Options - Prevents MIME-sniffing
  noSniff: true,

  // X-XSS-Protection - Legacy but still useful for older browsers
  xssFilter: true,

  // Referrer-Policy - Controls referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // X-Permitted-Cross-Domain-Policies - Blocks Flash/PDF cross-domain loading
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Hide X-Powered-By header to prevent technology fingerprinting
  hidePoweredBy: true,

  // DNS Prefetch Control - Prevents DNS prefetch attacks
  dnsPrefetchControl: {
    allow: false,
  },
};

export default config;
