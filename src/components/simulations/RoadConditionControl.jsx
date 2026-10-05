import { useState } from 'react';
import { useRouting } from '../../app/routingState';
import { congestionConfig } from '../../optimization/graph/costConfig';
import { groupRouteStreets } from '../../optimization/graph/routePresentation';
import Button from '../ui/Button';

export default function RoadConditionControl({ open, setOpen, onFocus, onHighlight, onChange, recalculateProps }) {
  const { schedule, demo, network, ovalAccesses, originalPlanningRoads, simulateCongestion, setDemoProblem, resetCondition, recalculateDemo } = useRouting();
  const [type, setType] = useState('closure');
  const [level, setLevel] = useState('moderate');
  const condition = demo.condition;
  const streets = groupRouteStreets((type === 'congestion' ? schedule.route : demo.initial)?.segments);
  const uniqueStreets = [...new Map(streets.map(group => [group.streetName, group])).values()];
  const previous = condition?.type === 'congestion' ? condition.previous : [];
  const maximumFactor = Math.max(0, ...previous.map(edge => edge.factor));
  const chooseType = next => {
    if (condition && condition.type !== next) { resetCondition(); onChange(); }
    setOpen(type === next ? !open : true); setType(next);
  };
  const selectStreet = streetName => {
    const edges = network.edges.filter(edge => edge.streetName === streetName);
    if (type === 'closure') setDemoProblem({ closed: true, closureMode: 'total', edgeIds: edges.map(edge => edge.id) });
    else {
      const maximum = Math.max(...originalPlanningRoads.filter(edge => edge.streetName === streetName).map(edge => edge.factor));
      const next = congestionConfig.factors[level] > maximum ? level : congestionConfig.levels.find(value => congestionConfig.factors[value] > maximum);
      if (!next) return;
      setLevel(next); simulateCongestion(streetName, next);
    }
    onFocus(edges); onChange();
  };
  const selectAccess = access => {
    setDemoProblem({ closed: true, closureMode: access.total ? 'total' : 'access', accessId: access.id, streetName: access.label, edgeIds: access.edgeIds });
    onFocus(access.segments); onChange();
  };
  const streetChoices = uniqueStreets.map(group => <label key={group.id}><input type="radio" name="road-condition" checked={condition?.type === type && !condition.accessId && condition.streetName === group.streetName}
    disabled={type === 'congestion' && originalPlanningRoads.some(edge => edge.streetName === group.streetName && edge.factor >= congestionConfig.factors.congested)}
    onChange={() => selectStreet(group.streetName)} />{group.streetName}</label>);
  return <div className="planner-disclosure"><p>SIMULAR CONDICIÓN VIAL</p>
    <div className="condition-actions"><Button onClick={() => chooseType('congestion')}>Aumentar congestión</Button><Button onClick={() => chooseType('closure')}>Cierre en Óvalo Musical</Button></div>
    {open && <div className="closure-options">
      {type === 'congestion' ? <><strong>Selecciona una calle de la ruta actual</strong>{streetChoices}</> : <>
        <strong>SIMULAR RESTRICCIÓN EN ÓVALO MUSICAL</strong><span>Selecciona el acceso restringido:</span>
        {ovalAccesses.map(access => <label key={access.id} onMouseEnter={() => onHighlight?.(access.edgeIds)} onMouseLeave={() => onHighlight?.([])}><input type="radio" name="road-condition" checked={condition?.accessId === access.id} onFocus={() => onHighlight?.(access.edgeIds)} onBlur={() => onHighlight?.([])} onChange={() => selectAccess(access)} />{access.label}</label>)}
        <small>Los accesos corresponden a conexiones existentes en la red OSM. El cierre parcial afecta solo al grupo seleccionado.</small>
        <details><summary>Otras vías de la ruta</summary><div className="closure-options">{streetChoices}</div></details>
      </>}
      {type === 'congestion' && <><label htmlFor="congestion-level">Nuevo nivel de congestión</label><select id="congestion-level" value={condition?.type === 'congestion' ? condition.level : level} onChange={event => {
        setLevel(event.target.value); if (condition?.type === 'congestion') { simulateCongestion(condition.streetName, event.target.value); onChange(); }
      }}>{congestionConfig.levels.map(value => <option key={value} value={value} disabled={congestionConfig.factors[value] <= maximumFactor}>{congestionConfig.labels[value]} = {congestionConfig.factors[value].toFixed(1)}</option>)}</select></>}
      {condition?.type === 'congestion' && <div className="condition-summary"><p>Vía: {condition.streetName}</p><p>Nivel anterior: {[...new Set(previous.map(edge => congestionConfig.labels[edge.level]))].join(', ')}</p><p>Nuevo nivel: {congestionConfig.labels[condition.level]}</p><p>Factor anterior: {[...new Set(previous.map(edge => edge.factor.toFixed(1)))].join(', ')}</p><p>Nuevo factor: {congestionConfig.factors[condition.level].toFixed(1)}</p><p>La vía continúa disponible, pero ahora tiene mayor costo dentro del modelo.</p></div>}
      {condition?.type === 'closure' && <p className="closure-alert">⚠ Simulación activa · {condition.streetName}. {condition.accessId && condition.closureMode === 'access' ? 'Este acceso/intersección del Óvalo Musical no puede utilizarse. Los demás accesos continúan disponibles.' : 'La vía se excluye durante el recálculo.'}</p>}
      <div {...recalculateProps}><Button variant="primary" disabled={!condition} onClick={() => { recalculateDemo(); onChange(); }}>RECALCULAR RUTA</Button></div>
    </div>}
    {condition && <button className="text-button" onClick={() => { resetCondition(); onChange(); }}>RESTABLECER CONDICIÓN</button>}
  </div>;
}