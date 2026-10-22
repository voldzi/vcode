// A host can contain multiple independent applications. Domain-only matching
// must never claim one application's connectivity on behalf of another.
export function monitorIdentity(site) {
  return {
    siteId: site.id,
    domain: site.domain,
    trackerPath: site.trackerPath,
    collectorPath: site.collectorPath,
  };
}

export function connectionForSite(site, registered, connections) {
  const exact = connections.find(connection =>
    connection.siteId === site.id &&
    connection.domain === site.domain &&
    (!connection.trackerPath || connection.trackerPath === site.trackerPath) &&
    (!connection.collectorPath || connection.collectorPath === site.collectorPath)
  );
  if (exact) return exact;

  // During a rolling upgrade, old monitors have no siteId. Retain their result
  // only when the registry proves there is exactly one site on that hostname.
  const sameDomain = registered.filter(candidate => candidate.domain === site.domain);
  if (sameDomain.length !== 1) return null;
  return connections.find(connection =>
    !connection.siteId && connection.domain === site.domain
  ) ?? null;
}
