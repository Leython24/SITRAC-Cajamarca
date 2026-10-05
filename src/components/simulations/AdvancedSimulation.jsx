import { useState } from 'react';
import { mockInitialSimulation, mockSimulationOptions, mockPresets } from '../../data/mock/scenario';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Notice from '../ui/Notice';
import ScenarioControl from './ScenarioControl';
import SimulationResult from './SimulationResult';
import { useRouting, copyScenario } from '../../app/routingState';

export default function AdvancedSimulation() {
  const { config, setConfig, calculate, edges } = useRouting();
  const [presets, setPresets] = useState(mockPresets);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [notice, setNotice] = useState('');
  const update = (key, value) => { setConfig(current => ({ ...current, [key]: value })); setSelectedPreset(''); };
  const changeIncident = id => update('incidents', config.incidents.includes(id) ? config.incidents.filter(item => item !== id) : [...config.incidents, id]);
  const reset = () => { setConfig(copyScenario(mockInitialSimulation)); setSelectedPreset(''); setNotice('Configuración DEMO restablecida.'); };
  const save = () => {
    const preset = { id: `local-${presets.length}`, name: `Escenario DEMO ${presets.length + 1}`, detail: 'Configuración guardada temporalmente en esta pantalla.', config: copyScenario(config) };
    setPresets([...presets, preset]); setSelectedPreset(preset.id); setNotice('Configuración guardada en memoria. Se perderá al salir de esta pantalla o recargar.');
  };
  return <div className="advanced-simulation">

    <div className="simulation-columns"><div className="simulation-config"><Panel><div className="section-header"><h2><Icon name="tune" />Configuración en 4 Pasos</h2><span className="subtle-label">Parámetros DEMO</span></div>
      <ScenarioControl step="1" title="Paso 1: Cambiar tráfico" description="Ajusta el volumen general de vehículos en las calles." status={config.traffic ? `+${config.traffic}% seleccionado` : 'Normal'}><div className="option-group">{mockSimulationOptions.traffic.map(value => <button key={value} aria-pressed={config.traffic === value} onClick={() => update('traffic', value)}>{value ? `+${value}%` : 'Normal'}</button>)}</div></ScenarioControl>
      <ScenarioControl step="2" title="Paso 2: Cambiar cantidad de vehículos de carga" description="Define cuántos camiones o furgones ingresan al cuadrante." status={`+${config.freight} vehículos`}><div className="option-group">{mockSimulationOptions.freight.map(value => <button key={value} aria-pressed={config.freight === value} onClick={() => update('freight', value)}>{value ? `+${value} vehículos` : 'Flota base'}</button>)}</div></ScenarioControl>
      <ScenarioControl step="3" title="Paso 3: Agregar incidente o cerrar una vía" status={`${config.incidents.length} seleccionado(s)`}><div className="incident-options">{mockSimulationOptions.incidents.map(incident => <label key={incident.id}><input type="checkbox" checked={config.incidents.includes(incident.id)} onChange={() => changeIncident(incident.id)} /><span>{incident.label}<small>{edges.find(edge => edge.id === config.incidentEdgeId).name}</small></span></label>)}</div></ScenarioControl>
      <ScenarioControl step="4" title="Paso 4: Aplicar restricción horaria" description="Selecciona una ventana de restricción para vehículos de carga."><label className="toggle-label"><input type="checkbox" role="switch" checked={config.restricted} onChange={event => update('restricted', event.target.checked)} />Activar horario</label><div className="time-fields"><label>Desde<input type="time" aria-label="Restricción desde" value={config.from} disabled={!config.restricted} onChange={event => update('from', event.target.value)} /></label><label>Hasta<input type="time" aria-label="Restricción hasta" value={config.to} disabled={!config.restricted} onChange={event => update('to', event.target.value)} /></label><span>Centro Histórico</span></div>{config.restricted && config.from > config.to && <p className="small">La ventana finaliza al día siguiente.</p>}</ScenarioControl>
    </Panel><Panel className="simulation-summary"><div className="section-header"><span className="metric-label">Resumen de cambios · DEMO</span><button className="text-button" onClick={reset}>Restablecer</button></div><div className="summary-chips"><span><Icon name="trending_up" />Tráfico +{config.traffic}%</span><span><Icon name="local_shipping" />Carga +{config.freight} vehículos</span>{config.incidents.map(id => <span className="danger-chip" key={id}><Icon name="block" />{mockSimulationOptions.incidents.find(i => i.id === id).label}</span>)}{config.restricted && <span><Icon name="schedule" />Restricción {config.from} – {config.to}</span>}</div><Button variant="primary" className="full-width" icon="play_arrow" onClick={() => { if (config.restricted && (!config.from || !config.to || config.from === config.to)) { setNotice('Selecciona un horario de inicio y fin distintos para completar la configuración.'); return; } calculate(); setNotice('Configuración aplicada a Dijkstra. No se han calculado resultados de simulación de tráfico ni asignación de horarios.'); }}>SIMULAR</Button>{notice && <Notice>{notice}</Notice>}</Panel></div><SimulationResult /></div>
    <Panel className="scenario-history"><div className="section-header"><div><h3>Historial de Pruebas Rápidas</h3><p>Plantillas DEMO y configuraciones temporales de esta pantalla</p></div><Button icon="bookmark_add" onClick={save}>Guardar este Escenario</Button></div><div className="history-grid">{presets.map(preset => <article key={preset.id} className={`history-card ${selectedPreset === preset.id ? 'selected' : ''}`}><h4>{preset.name}</h4><p>{preset.detail}</p><div><code>Demora red: —</code><button className="text-button" aria-label={`Cargar ${preset.name}`} onClick={() => { setConfig(copyScenario(preset.config)); setSelectedPreset(preset.id); setNotice(`Configuración «${preset.name}» cargada. Dijkstra usa estas condiciones; los indicadores de tráfico y horarios siguen pendientes.`); }}>{selectedPreset === preset.id ? 'Cargado' : 'Cargar'}</button></div></article>)}</div></Panel>
  </div>;
}

