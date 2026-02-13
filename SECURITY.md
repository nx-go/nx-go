# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within nx-go, please send an email to the maintainers or report it through GitHub Security Advisories.

**Please do not report security vulnerabilities through public GitHub issues.**

### Process

1. **Report**: Submit a detailed report via [GitHub Security Advisories](https://github.com/nx-go/nx-go/security/advisories/new) or email the maintainers
2. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
3. **Assessment**: We will assess the vulnerability and determine its impact and severity
4. **Fix**: We will work on a fix and keep you informed of our progress
5. **Release**: Once a fix is ready, we will release a security patch and publicly disclose the vulnerability

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- A response acknowledging your report within 48 hours
- Regular updates on our progress
- Credit in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When using nx-go in your projects:

- Always use the latest stable version
- Keep your Go toolchain up-to-date
- Regularly run `nx migrate @nx-go/nx-go` to stay current with security patches
- Review dependency updates and security advisories
- Use `go mod tidy` to keep your dependencies clean and up-to-date

## Disclosure Policy

- Security vulnerabilities will be disclosed publicly after a fix is released
- We will credit security researchers who responsibly disclose vulnerabilities (unless they prefer anonymity)
- We aim to release security patches within 30 days of receiving a valid report

Thank you for helping keep nx-go and its users safe!
