import { congestionConfig } from './costConfig';

export function evaluateEdge(edge, conditions = {}, config = congestionConfig) {
  const distance = edge.distance;
  const traffic = conditions.trafficIncrease ?? 0;
  if (!Number.isFinite(distance) || distance < 0) throw new RangeError('La distancia debe ser finita y no negativa.');
  if (!Number.isFinite(traffic) || traffic < 0) throw new RangeError('El incremento de tráfico debe ser finito y no negativo.');
  const levels = config.levels;
  let level = levels.indexOf(edge.congestion);
  if (level < 0) throw new RangeError('Nivel de congestión desconocido.');
  const thresholds = config.trafficThresholds[edge.response ?? 'primary'];
  if (!thresholds) throw new RangeError('Respuesta al tráfico desconocida.');
  level = Math.min(levels.length - 1, level + thresholds.filter(value => traffic >= value).length);
  const override = conditions.congestionOverrides?.[edge.id];
  if (override != null) {
    level = levels.indexOf(override);
    if (level < 0) throw new RangeError('Nivel de congestión desconocido.');
  }
  const incidents = conditions.incidents ?? [];
  if (conditions.incidentEdgeId === edge.id) {
    for (const incident of incidents) {
      if (config.incidents[incident]) level = Math.max(level, levels.indexOf(config.incidents[incident]));
    }
  }
  const congestion = levels[level];
  const factor = config.factors[congestion];
  if (!Number.isFinite(factor) || factor < 0) throw new RangeError('El factor debe ser finito y no negativo.');
  const blocked = edge.status === 'blocked' || (conditions.blockedEdgeIds ?? []).includes(edge.id)
    || (conditions.incidentEdgeId === edge.id && incidents.includes('closure'));
  const cost = blocked ? null : distance * factor;
  if (!blocked && !Number.isFinite(cost)) throw new RangeError('Costo fuera del rango numérico.');
  return { ...edge, congestion, factor, status: blocked ? 'blocked' : 'open', cost };
}
