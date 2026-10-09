import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const document = JSON.parse(await readFile(new URL("../openapi/openapi.json", import.meta.url), "utf8"));
const internal = JSON.parse(await readFile(new URL("../services/blog/partnership-openapi.json", import.meta.url), "utf8"));

function validateDocument(contract, label) {
  assert.match(String(contract.openapi ?? ""), /^3\./, `${label}: OpenAPI 3.x required`);
  assert.ok(contract.info?.title && contract.info?.version, `${label}: title and version required`);
  const resolvePointer = pointer => pointer.slice(2).split("/").reduce((value, segment) => value?.[segment.replaceAll("~1", "/").replaceAll("~0", "~")], contract);
  const visit = value => {
    if (!value || typeof value !== "object") return;
    if (typeof value.$ref === "string") {
      assert.ok(value.$ref.startsWith("#/"), `${label}: only self-contained local references are allowed`);
      assert.notEqual(resolvePointer(value.$ref), undefined, `${label}: unresolved reference ${value.$ref}`);
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(contract);
  for (const item of Object.values(contract.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      if (!httpMethods.includes(method)) continue;
      for (const requirement of operation.security ?? []) {
        for (const name of Object.keys(requirement)) {
          assert.ok(contract.components.securitySchemes?.[name], `${label}: undefined security scheme ${name}`);
        }
      }
    }
  }
}

const httpMethods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
validateDocument(document, "Public API");
validateDocument(internal, "Private partnership API");
if (!document.paths?.["/health/blog"]?.get) throw new Error("GET /health/blog is missing from OpenAPI");
if (!document.paths?.["/api/blog/{slug}/comments"]?.post) throw new Error("POST /api/blog/{slug}/comments is missing from OpenAPI");

const browserRoutes = {
  "/prehled/api/partnerships": ["get"],
  "/prehled/api/partnerships/{id}": ["delete", "patch"],
  "/prehled/api/partnerships/{id}/promote": ["post"],
  "/prehled/api/partners": ["get"],
  "/prehled/api/partners/{id}": ["delete"]
};
const privateRoutes = {
  "/internal/partnerships/v1/challenge": ["post"],
  "/internal/partnerships/v1/submissions": ["post"],
  "/internal/partnerships/v1/inquiries": ["get"],
  "/internal/partnerships/v1/inquiries/{id}": ["delete", "patch"],
  "/internal/partnerships/v1/inquiries/{id}/promote": ["post"],
  "/internal/partnerships/v1/partners": ["get"],
  "/internal/partnerships/v1/partners/{id}": ["delete"]
};
function checkRoutes(contract, expected, select) {
  assert.deepEqual(Object.keys(contract.paths).filter(select).sort(), Object.keys(expected).sort(), "Unexpected partnership path boundary");
  for (const [path, methods] of Object.entries(expected)) {
    assert.deepEqual(Object.keys(contract.paths[path]).filter(key => httpMethods.includes(key)).sort(), methods, `Wrong methods for ${path}`);
  }
}
checkRoutes(document, browserRoutes, path => /^\/prehled\/api\/(partnerships|partners)(\/|$)/.test(path));
checkRoutes(internal, privateRoutes, () => true);
assert.ok(!JSON.stringify(document).includes("/internal/"), "Internal paths must never enter the public contract");
for (const forbidden of ["partnershipApplicationKey", "partnershipInboxService", "X-VCode-Admin-Id", "x-private-interface"]) {
  assert.ok(!JSON.stringify(document).includes(forbidden), `Private credential or route metadata leaked: ${forbidden}`);
}
assert.equal(internal["x-contract-version"], "partnership-intake-v1");
assert.deepEqual(internal.components.schemas.ContactApplication, document.components.schemas.ContactApplication, "Private app identities must match the public canonical catalog");
assert.deepEqual(Object.keys(internal.components.securitySchemes).sort(), ["partnershipApplicationKey", "partnershipInboxService"]);

for (const [path, methods] of Object.entries(browserRoutes)) {
  for (const method of methods) assert.deepEqual(document.paths[path][method].security, [{ metricsSession: [] }]);
}
for (const [path, methods] of Object.entries(privateRoutes)) {
  assert.equal(internal.paths[path]["x-private-interface"], true, `Private-only marker missing: ${path}`);
  const intake = /\/(challenge|submissions)$/.test(path);
  for (const method of methods) {
    const operation = internal.paths[path][method];
    assert.deepEqual(operation.security, [{ [intake ? "partnershipApplicationKey" : "partnershipInboxService"]: [] }]);
    if (!intake) {
      const actor = operation.parameters?.find(parameter => parameter.name === "X-VCode-Admin-Id");
      assert.ok(actor?.required && actor.in === "header", `Verified owner header missing: ${path}`);
      assert.equal(actor.schema.format, "uuid");
    }
    if (operation.requestBody) assert.equal(operation["x-max-request-bytes"], 16384);
  }
}
const challenge = internal.components.schemas.PartnershipChallengeRequest;
assert.equal(challenge.additionalProperties, false);
assert.deepEqual(challenge.required, ["requestId", "locale", "clientBucket"]);
const submission = internal.components.schemas.PartnershipSubmission;
assert.equal(submission.additionalProperties, false);
assert.equal(submission.properties.token.minLength, 1);
assert.equal(submission.properties.token.maxLength, 2048);
assert.equal(submission.properties.privacyVersion.const, "partnership-intake-20261009-1");
assert.ok(!["appId", "domain", "account", "source"].some(name => name in submission.properties));
assert.ok(!("managerId" in internal.components.schemas.PartnershipInbox.properties), "Service must not emit the browser owner context");
assert.ok(document.components.schemas.PartnershipDashboardInbox.required.includes("managerId"));
console.log("Public and nonpublished private OpenAPI contracts validated.");
