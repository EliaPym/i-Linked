# Y-Link

A quick and easy to use URL shortening service.#

## Features

- Create shortened links for long URLs
- Custom link aliases

## Tech Stack
- AWS VPC
    - Lambda
    - CloudFront
    - DynamoDB
    - API Gateway
    - S3
- Python
    - FastAPI
    - Mangum
- NextJS
    - Typescript
    - React
    - Tailwind
- REST API

![alt text](https://i-linked.org/Github%20Repo%20Files/URL%20Shortener%20Diagram%20Dark.png "i-Linked Tech Stack Diagram")

## Installation

```bash
git clone https://github.com/yourusername/Y-Link.git
cd Y-Link
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

## API Documentation

API endpoints used by i-Linked.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `api.i-l.ink/XXXXX` | GET | Retrieve specific link |
| `api.i-l.ink/Shorten` | POST | Create a new short link |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request