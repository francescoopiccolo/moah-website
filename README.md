# MoAH website

Static site and installers for [MoAH](https://github.com/francescoopiccolo/MoAH).

This repository is separate from the agent source. GitHub Pages publishes the
root of `main`; `.nojekyll` preserves the static HTML without a build step.

The bundled Manrope and Barlow Condensed web fonts are licensed under the SIL
Open Font License 1.1. Their copyright notices and full licenses are published
in [`assets/licenses/`](assets/licenses/README.txt).
The repository's [MIT license](LICENSE) covers the original website code; the
bundled fonts retain their separate licenses.

When changing `script.js` or `styles.css`, update the `?v=` identifier on every
HTML reference to that asset. This prevents browsers from running a cached
script against newer HTML after a deployment.

Installers require Node.js >=22.19 and npm, install `moah-ai@latest` into a user
directory, verify the installed CLI, and add its launcher to the user's PATH.
They do not install Node.js or change the system execution policy.

`MOAH_INSTALL_DIR` overrides the installation directory.
`MOAH_NO_PATH_UPDATE=1` skips persistent PATH changes for CI or managed setups.

The installation workflow checks npm, pnpm, Bun and the matching installer on
Windows, Linux and macOS. Run `node tests/install-smoke.mjs` with all three
package managers available to reproduce those checks.
