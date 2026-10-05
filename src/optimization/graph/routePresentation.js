export function presentRoute(result) {
  const segments = result.segments.map((edge, index) => ({ ...edge, order: index + 1, edgeId: edge.id, streetName: edge.streetName ?? edge.name,
    congestionLevel: edge.congestion, congestionFactor: edge.factor, geometry: edge.geometry }));
  return { ...result, segments, coordinates: segments.length ? segments.flatMap((edge, index) => index ? edge.geometry.slice(1) : edge.geometry) : result.coordinates };
}

export function groupRouteStreets(segments = []) {
  return segments.reduce((groups, segment) => {
    let group = groups.at(-1);
    if (!group || group.streetName !== segment.streetName) { group = { id: `street-${segment.order}`, streetName: segment.streetName, edgeIds: [], segments: [], distance: 0 }; groups.push(group); }
    group.edgeIds.push(segment.edgeId); group.segments.push(segment); group.distance += segment.distance;
    return groups;
  }, []);
}
