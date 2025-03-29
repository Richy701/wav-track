# Supabase CLI (v1)

[![Coverage Status](https://coveralls.io/repos/github/supabase/cli/badge.svg?branch=main)](https://coveralls.io/github/supabase/cli?branch=main) [![Bitbucket Pipelines](https://img.shields.io/bitbucket/pipelines/supabase-cli/setup-cli/master?style=flat-square&label=Bitbucket%20Canary)](https://bitbucket.org/supabase-cli/setup-cli/pipelines) [![Gitlab Pipeline Status](https://img.shields.io/gitlab/pipeline-status/sweatybridge%2Fsetup-cli?label=Gitlab%20Canary)](https://gitlab.com/sweatybridge/setup-cli/-/pipelines)

[Supabase](https://supabase.io) is an open source Firebase alternative. We're building the features of Firebase using enterprise-grade open source tools.

This repository contains all the functionality for Supabase CLI.

- [x] Running Supabase locally
- [x] Managing database migrations
- [x] Creating and deploying Supabase Functions
- [x] Generating types directly from your database schema
- [x] Making authenticated HTTP requests to [Management API](https://supabase.com/docs/reference/api/introduction)

## Getting started

### Install the CLI

Available via [NPM](https://www.npmjs.com) as dev dependency. To install:

```bash
npm i supabase --save-dev
```

To install the beta release channel:

```bash
npm i supabase@beta --save-dev
```

When installing with yarn 4, you need to disable experimental fetch with the following nodejs config.

```bash
NODE_OPTIONS=--no-experimental-fetch yarn add supabase
```

> **Note**
> For Bun versions below v1.0.17, you must add `supabase` as a [trusted dependency](https://bun.sh/guides/install/trusted) before running `bun add -D supabase`.

<!-- markdownlint-disable MD033 -->
<details>
  <summary><strong>macOS</strong></summary>

  Available via [Homebrew](https://brew.sh). To install:

  ```bash
  brew install supabase/tap/supabase
  ```

  To install the beta release channel:
  
  ```bash
  brew install supabase/tap/supabase-beta
  brew link --overwrite supabase-beta
  ```
  
  To upgrade:

  ```bash
  brew upgrade supabase
  ```

</details>

<details>
  <summary><strong>Windows</strong></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```

</details>

<details>
  <summary><strong>Linux</strong></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

#### via Homebrew

  To install:

  ```bash
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```bash
  brew upgrade supabase
  ```

#### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```bash
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```bash
  sudo dpkg -i <...>.deb
  ```

  ```bash
  sudo rpm -i <...>.rpm
  ```

  ```bash
  sudo pacman -U <...>.pkg.tar.zst
  ```

</details>

<details>
  <summary><strong>Other Platforms</strong></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```bash
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```bash
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><strong>Community Maintained Packages</strong></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>
<!-- markdownlint-enable MD033 -->

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```bash
# Go >= 1.22
go run . help
```

# WavTrack Monorepo

[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

## Project Structure

```
/wavtrack
  /web            ← Vite + React web app
  /mobile         ← Expo mobile app
  /shared         ← Shared utilities, types, and config
  package.json    ← Root monorepo config
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development servers:
   - Web app: `npm run web`
   - Mobile app: `npm run mobile`
   - Both: `npm run dev`

## Development

### Web App
The web app is built with Vite + React and is located in the `/web` directory.

### Mobile App
The mobile app is built with Expo and is located in the `/mobile` directory.

### Shared Code
The `/shared` directory contains code that can be used by both the web and mobile apps:
- Types: Shared TypeScript types
- Utils: Common utility functions
- Config: Shared configuration (e.g., Supabase client)

## Best Practices

1. Keep platform-specific code in its respective directory
2. Use the shared directory for code that can be reused across platforms
3. Follow the established TypeScript and ESLint configurations
4. Use relative imports from the shared directory when needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
