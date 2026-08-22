# Sportswear backoffice upstream vet

source_sha: 66976899b05dcf19f0a22ac8e092934813e82bb8
upstream_repo: medusajs/dtc-starter
upstream_sha: 7d0d4767a314a3ece4c2cd4e881e52f5f9cce845
upstream_medusa: 2.19.0
upstream_dashboard: 2.19.0
pin_outcome: success
install_outcome: success
build_outcome: success
migrate_outcome: success
start_outcome: failure
smoke_outcome: skipped
workflow_run_id: 32592244295

```text
health=
> @dtc/backend@0.0.1 start /tmp/medusa-dtc/apps/backend
> medusa start

[32minfo[39m:    redisUrl not found. A fake redis instance will be used.
- Creating server
[32minfo[39m:    redisUrl not found. A fake redis instance will be used.
[32minfo[39m:    Skipping instrumentation registration. No register function found.
[32minfo[39m:    redisUrl not found. A fake redis instance will be used.
[32minfo[39m:    No link to load from /tmp/medusa-dtc/node_modules/.pnpm/@medusajs+draft-order@2.19.0_@medusajs+admin-sdk@2.19.0_@medusajs+cli@2.19.0_@types+nod_420b090e71a3a9e95d036d3c85dce4d2/node_modules/@medusajs/draft-order/.medusa/server/src/links. skipped.
[33mwarn[39m:    Local Event Bus installed. This is not recommended for production.
[32minfo[39m:    Locking module: Using "in-memory" as default.
[32minfo[39m:    No workflow to load from /tmp/medusa-dtc/node_modules/.pnpm/@medusajs+draft-order@2.19.0_@medusajs+admin-sdk@2.19.0_@medusajs+cli@2.19.0_@types+nod_420b090e71a3a9e95d036d3c85dce4d2/node_modules/@medusajs/draft-order/.medusa/server/src/workflows. skipped.
[32minfo[39m:    No subscriber to load from /tmp/medusa-dtc/node_modules/.pnpm/@medusajs+draft-order@2.19.0_@medusajs+admin-sdk@2.19.0_@medusajs+cli@2.19.0_@types+nod_420b090e71a3a9e95d036d3c85dce4d2/node_modules/@medusajs/draft-order/.medusa/server/src/subscribers. skipped.
[32minfo[39m:    No job to load from /tmp/medusa-dtc/node_modules/.pnpm/@medusajs+medusa@2.19.0_2ebf8d33f1ff1d56cc4db6b1fa3b3e12/node_modules/@medusajs/medusa/dist/jobs. skipped.
[32minfo[39m:    No job to load from /tmp/medusa-dtc/node_modules/.pnpm/@medusajs+draft-order@2.19.0_@medusajs+admin-sdk@2.19.0_@medusajs+cli@2.19.0_@types+nod_420b090e71a3a9e95d036d3c85dce4d2/node_modules/@medusajs/draft-order/.medusa/server/src/jobs. skipped.
[31merror[39m:   Error starting server: Could not find index.html in the admin build directory. Make sure to run 'medusa build' before starting the server.
Error: Could not find index.html in the admin build directory. Make sure to run 'medusa build' before starting the server.
    at serve (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+admin-bundler@2.19.0_@sinclair+typebox@0.34.41_@types+node@20.19.26_@types+re_1e4e1a9bcde31a426db4a7395670b294/node_modules/@medusajs/admin-bundler/dist/index.js:1642:11)
    at serveProductionBuild (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+medusa@2.19.0_2ebf8d33f1ff1d56cc4db6b1fa3b3e12/node_modules/@medusajs/medusa/src/loaders/admin.ts:90:28)
    at async Promise.allSettled (index 1)
    at async promiseAll (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+utils@2.19.0_@types+node@20.19.26_express@4.22.1/node_modules/@medusajs/utils/src/common/promise-all.ts:27:18)
    at async loadEntrypoints (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+medusa@2.19.0_2ebf8d33f1ff1d56cc4db6b1fa3b3e12/node_modules/@medusajs/medusa/src/loaders/index.ts:118:26)
    at async exports.default (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+medusa@2.19.0_2ebf8d33f1ff1d56cc4db6b1fa3b3e12/node_modules/@medusajs/medusa/src/loaders/index.ts:225:7)
    at async internalStart (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+medusa@2.19.0_2ebf8d33f1ff1d56cc4db6b1fa3b3e12/node_modules/@medusajs/medusa/src/commands/start.ts:272:59)
    at async start (/tmp/medusa-dtc/node_modules/.pnpm/@medusajs+medusa@2.19.0_2ebf8d33f1ff1d56cc4db6b1fa3b3e12/node_modules/@medusajs/medusa/src/commands/start.ts:426:12)
 ELIFECYCLE  Command failed with exit code 1.
```
