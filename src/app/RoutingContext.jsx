import { useMemo, useState } from 'react';
import { demoRoadNetwork, demoRouteEndpoints } from '../data/mock/roadNetwork';
import { mockInitialSimulation } from '../data/mock/scenario';
import { routeAppearance } from '../data/mapConfig';
import { congestionConfig } from '../optimization/graph/costConfig';
import { buildGraph } from '../optimization/graph/buildGraph';
import { dijkstra } from '../optimization/graph/dijkstra';
import { explainRoute } from '../optimization/graph/explainRoute';
import { splitRoadAtPoint, conditionsForNetwork } from '../optimization/graph/roadSelection';
import { presentRoute } from '../optimization/graph/routePresentation';
import { mockVehicles } from '../data/mock/vehicles';
import { provenanceOptions, provenanceById } from '../data/mock/provenance';
import { mockDestinations } from '../data/mock/destinations';
import { buildPlanningSchedule, rankFeasibleScheduleOptions } from '../optimization/scheduling/planningOptions';
import { getOvalAccesses } from '../optimization/graph/ovalAccesses';
import { solveSchedule } from '../optimization/scheduling/solveSchedule';
import { routeConditionsForSlot } from '../optimization/scheduling/routeConditions';
import { RoutingContext, copyScenario } from './routingState';

const emptyDemo = () => ({ initial: null, updated: null, previousRoute: null, condition: null, closed: false, edgeId: null, edgeIds: [] });
const simulationConditions = condition => ({
  blockedEdgeIds: condition?.type === 'closure' ? condition.edgeIds : [],
  congestionOverrides: condition?.type === 'congestion' ? Object.fromEntries(condition.edgeIds.map(id => [id, condition.level])) : {},
});
const emptySchedule = vehicleId => ({ vehicleId, result: null, route: null, originalRoute: null, restrictedSlots: [], model: null, alternatives: [], assignment: null });
const displayRoad = edge => ({ ...edge, positions: edge.geometry, state: edge.status === 'blocked' ? 'Vía bloqueada' : congestionConfig.labels[edge.congestion], color: edge.status === 'blocked' ? '#dc2626' : congestionConfig.colors[edge.congestion], tone: edge.status === 'blocked' ? 'danger' : 'success' });
const asMapRoute = (result, appearance) => result?.status === 'found' ? { ...appearance, calculated: true, positions: result.coordinates, segments: result.segments, distanceTotal: result.distanceTotal, costTotal: result.costTotal } : null;

export function RoutingProvider({ children }) {
  const [config, setConfig] = useState(() => copyScenario(mockInitialSimulation));
  const [origin, setOriginState] = useState(demoRouteEndpoints.origin);
  const [destination, setDestinationState] = useState(demoRouteEndpoints.destination);
  const [destinationSelection, setDestinationSelection] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(mockVehicles[0].id);
  const [provenanceId, setProvenanceId] = useState('costa');
  const [hasCalculated, setHasCalculated] = useState(false);
  const [demo, setDemo] = useState(emptyDemo);
  const [comparisonView, setComparisonView] = useState('after');
  const [exposure, setExposure] = useState({ enabled: false, step: 1 });
  const [schedule, setSchedule] = useState(() => emptySchedule(mockVehicles[0].id));
  const vehicle = mockVehicles.find(item => item.id === selectedVehicleId);
  const provenance = provenanceById[provenanceId];
  const temporary = useMemo(() => splitRoadAtPoint(demoRoadNetwork, destinationSelection), [destinationSelection]);
  const network = temporary.network;
  const graph = useMemo(() => buildGraph(network), [network]);
  const destinationNode = graph.nodeById.get(destination);
  const knownDestination = mockDestinations.find(item => item.nodeId === destination);
  const destinationInfo = { name: destinationSelection ? destinationNode.displayName : knownDestination?.name ?? destinationNode?.displayName,
    category: destinationSelection ? 'Punto seleccionado sobre una vía' : knownDestination?.category ?? 'Punto de entrega DEMO', geographicReal: Boolean(knownDestination?.verified) };
  const clearRoutes = () => { setDemo(emptyDemo()); setSchedule(current => ({ ...current, route: null, originalRoute: null })); };
  const setOrigin = value => { setOriginState(value); clearRoutes(); };
  const setDestination = value => { setDestinationSelection(null); setDestinationState(value); clearRoutes(); };
  const selectMapDestination = selection => {
    const next = splitRoadAtPoint(demoRoadNetwork, selection);
    setDestinationSelection(selection); setDestinationState(next.destinationId); clearRoutes();
    return next.network.nodes.find(item => item.id === next.destinationId);
  };
  const selectVehicle = id => {
    const nextVehicle = mockVehicles.find(item => item.id === id);
    if (!nextVehicle) return;
    const nextProvenance = provenanceOptions.find(item => item.label === nextVehicle.originCity) ?? provenanceOptions[0];
    setSelectedVehicleId(id); setProvenanceId(nextProvenance.id); setOriginState(nextVehicle.entryPointId ?? nextProvenance.entryPointId);
    setDestinationSelection(null); setDestinationState('G'); setDemo(emptyDemo()); setSchedule(emptySchedule(id));
  };
  const selectProvenance = id => { setProvenanceId(id); setOrigin(provenanceById[id].entryPointId); };
  const resetDemo = () => {
    selectVehicle(mockVehicles[0].id); setHasCalculated(false);
    setConfig({ ...copyScenario(mockInitialSimulation), traffic: 0, incidents: [], blockedEdgeIds: [], congestionOverrides: {} });
    setComparisonView('after'); setExposure(current => ({ ...current, step: 1 }));
  };
  const conditions = useMemo(() => conditionsForNetwork(network, { trafficIncrease: config.traffic, incidents: config.incidents, incidentEdgeId: config.incidentEdgeId, blockedEdgeIds: config.blockedEdgeIds, congestionOverrides: config.congestionOverrides }), [network, config]);
  const effectiveGraph = useMemo(() => buildGraph(graph, conditions), [graph, conditions]);
  const result = useMemo(() => hasCalculated ? dijkstra(graph, origin, destination, conditions) : null, [hasCalculated, graph, origin, destination, conditions]);
  const explanation = useMemo(() => explainRoute(graph, origin, destination, conditions, result), [graph, origin, destination, conditions, result]);
  const roads = useMemo(() => effectiveGraph.edges.map(displayRoad), [effectiveGraph]);
  const proposedRoute = asMapRoute(result, { ...routeAppearance.proposed, name: 'Ruta SITRAC' });
  const currentRoute = null;
  const calculate = () => setHasCalculated(true);
  const optimizeSchedule = (vehicleId, options = {}) => {
    const item = mockVehicles.find(value => value.id === vehicleId);
    const model = buildPlanningSchedule([item], { ...options, capacity: 1 });
    const result = solveSchedule(model);
    const alternatives = rankFeasibleScheduleOptions(model, vehicleId);
    setSchedule({ ...emptySchedule(vehicleId), result, model, alternatives, assignment: result.assignments[0] ?? null, restrictedSlots: options.restrictedSlots ?? [] });
    setDemo(emptyDemo());
    return result;
  };
  const selectScheduleOption = slot => {
    const assignment = schedule.alternatives.find(option => option.slot === slot);
    if (!assignment) return;
    setSchedule(current => ({ ...current, assignment, route: null, originalRoute: null }));
    setDemo(emptyDemo());
  };
  const computeRoute = (slot, blockedEdgeIds = [], congestionOverrides = {}) => {
    const routeConditions = conditionsForNetwork(network, { ...routeConditionsForSlot(slot), blockedEdgeIds, congestionOverrides });
    return { ...presentRoute(dijkstra(graph, origin, destination, routeConditions)), slot, conditions: routeConditions, origin, destination, vehicleId: selectedVehicleId };
  };
  const calculateScheduledRoute = () => {
    const selected = schedule.assignment ?? schedule.result?.assignments?.find(item => item.vehicleId === selectedVehicleId);
    if (!selected) return null;
    const originalSlot = schedule.model.candidates.get(selectedVehicleId)[0].slot;
    const originalRoute = computeRoute(originalSlot);
    const route = computeRoute(selected.slot);
    setSchedule(current => ({ ...current, route, originalRoute, originalSlot }));
    setDemo({ ...emptyDemo(), initial: route }); setComparisonView('after');
    return route;
  };
  const calculateDemo = () => {
    if (schedule.result?.status === 'optimal') return calculateScheduledRoute();
    const initial = computeRoute('08:00'); setDemo({ ...emptyDemo(), initial }); return initial;
  };
  const setDemoEndpoint = (key, value) => (key === 'origin' ? setOrigin : setDestination)(value);
  const originalPlanningRoads = buildGraph(graph, routeConditionsForSlot(demo.initial?.slot ?? schedule.assignment?.slot ?? schedule.result?.assignments?.[0]?.slot ?? '08:00')).edges;
  const stageCondition = condition => {
    const previousRoute = demo.updated ?? demo.previousRoute ?? demo.initial;
    const closed = condition.type === 'closure';
    setDemo(current => ({ ...current, condition, previousRoute, updated: null, closed,
      edgeIds: closed ? condition.edgeIds : [], edgeId: closed ? condition.edgeIds[0] : null }));
    setSchedule(current => ({ ...current, route: previousRoute ?? current.route }));
  };
  const resetCondition = () => {
    setDemo(current => ({ ...emptyDemo(), initial: current.initial }));
    setSchedule(current => ({ ...current, route: demo.initial ?? current.route }));
  };
  const setDemoProblem = changes => {
    if (!(changes.closed ?? demo.closed)) { resetCondition(); return; }
    const edgeIds = changes.edgeIds ?? [changes.edgeId ?? demo.edgeId ?? demo.initial?.edgeIds[0]].filter(Boolean);
    if (!edgeIds.length) return;
    const streetName = changes.streetName ?? network.edges.find(edge => edge.id === edgeIds[0])?.streetName;
    stageCondition({
      type: 'closure',
      closureMode: changes.closureMode ?? 'total',
      accessId: changes.accessId,
      streetName,
      edgeIds,
      distance: changes.distance ?? network.edges.find(edge => edge.id === edgeIds[0])?.distance,
    });
  };
  const simulateCongestion = (streetName, level) => {
    if (!demo.initial || !congestionConfig.levels.includes(level)) return null;
    if (!schedule.route?.segments.some(segment => segment.streetName === streetName) && demo.condition?.streetName !== streetName) return null;
    const previous = originalPlanningRoads.filter(edge => edge.streetName === streetName);
    if (!previous.length || previous.some(edge => congestionConfig.factors[level] <= edge.factor)) return null;
    const condition = { type: 'congestion', streetName, level, edgeIds: previous.map(edge => edge.id),
      previous: previous.map(edge => ({ edgeId: edge.id, level: edge.congestion, factor: edge.factor })) };
    stageCondition(condition);
    return condition;
  };
  const recalculateDemo = () => {
    if (!demo.initial || !demo.condition) return null;
    const conditions = simulationConditions(demo.condition);
    const previousRoute = demo.previousRoute ?? demo.initial;
    const calculated = computeRoute(demo.initial.slot, conditions.blockedEdgeIds, conditions.congestionOverrides);
    const sameRoute = calculated.status === 'found' && previousRoute.status === 'found'
      && calculated.edgeIds.length === previousRoute.edgeIds.length && calculated.edgeIds.every((id, index) => id === previousRoute.edgeIds[index]);
    const updated = { ...calculated, appliedEdges: conditions.blockedEdgeIds, appliedEdge: conditions.blockedEdgeIds[0] ?? null,
      simulatedCondition: demo.condition, previousRoute, sameRoute };
    setDemo(current => ({ ...current, updated }));
    setSchedule(current => ({ ...current, route: updated })); setComparisonView('after');
    return updated;
  };
  const activeResult = demo.updated ?? demo.initial;
  const planningConditions = conditionsForNetwork(network, { ...routeConditionsForSlot(activeResult?.slot ?? '08:00'), ...simulationConditions(demo.condition) });
  const planningRoads = buildGraph(graph, planningConditions).edges.map(edge => {
    const road = displayRoad(edge);
    return demo.condition?.type === 'congestion' && demo.condition.edgeIds.includes(edge.id)
      ? { ...road, simulatedCongestion: true, color: '#ea580c' } : road;
  });
  const endpoints = [
    { label: 'Origen', name: graph.nodeById.get(origin).displayName, position: [graph.nodeById.get(origin).latitude, graph.nodeById.get(origin).longitude], provenance, entryName: graph.nodeById.get(origin).displayName },
    { label: 'Destino', name: destinationInfo.name, position: [destinationNode.latitude, destinationNode.longitude], ...destinationInfo },
  ];
  const demoMapProps = (view = 'after', compare = false) => {
    const before = compare && view === 'before';
    const route = before ? demo.initial : activeResult;
    return { presentation: true, endpoints,
      currentRoute: !before && demo.updated ? asMapRoute(demo.previousRoute ?? demo.initial, { ...routeAppearance.current, name: 'Ruta anterior' }) : null,
      proposedRoute: asMapRoute(route, before ? { ...routeAppearance.current, name: 'Ruta anterior' } : { ...routeAppearance.proposed, name: 'Ruta SITRAC' }),
      roads: planningRoads, routingState: route?.status ?? 'pending', layers: { traffic: false, freight: false, current: true, proposed: true },
    };
  };
  const normalConditions = () => setConfig(current => ({ ...current, traffic: 0, incidents: [], blockedEdgeIds: [], congestionOverrides: {} }));
  const setCongestion = (id, level) => setConfig(current => ({ ...current, congestionOverrides: { ...current.congestionOverrides, [id]: level || undefined } }));
  const setBlocked = (id, blocked) => setConfig(current => ({ ...current, blockedEdgeIds: blocked ? [...new Set([...current.blockedEdgeIds, id])] : current.blockedEdgeIds.filter(value => value !== id), incidents: !blocked && current.incidentEdgeId === id ? current.incidents.filter(value => value !== 'closure') : current.incidents }));
  return <RoutingContext.Provider value={{ config, setConfig, origin, setOrigin, destination, setDestination, destinationSelection, destinationInfo, selectMapDestination,
    selectedVehicleId, selectVehicle, vehicle, provenanceId, provenance, selectProvenance, network, selectionRoads: demoRoadNetwork.edges,
    demo, calculateDemo, recalculateDemo, resetDemo, setDemoEndpoint, setDemoProblem, simulateCongestion, resetCondition, originalPlanningRoads, demoMapProps,
    comparisonView, setComparisonView, exposure, setExposure,
    result, explanation, roads, currentRoute, proposedRoute, calculate, normalConditions, setCongestion, setBlocked,
    vehicles: mockVehicles, schedule, optimizeSchedule, selectScheduleOption, calculateScheduledRoute, ovalAccesses: getOvalAccesses(network),
    nodes: network.nodes, edges: effectiveGraph.edges,
    mapProps: { roads, currentRoute, proposedRoute, routingState: result?.status ?? 'pending' },
  }}>{children}</RoutingContext.Provider>;
}
