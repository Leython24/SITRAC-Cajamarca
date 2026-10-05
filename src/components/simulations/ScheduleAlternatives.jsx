import { useRouting } from '../../app/routingState';
import { formatTime } from '../../utils/formatTime';
import { cajamarcaContext } from '../../data/references/cajamarcaContext';

export default function ScheduleAlternatives() {
  const { schedule, selectScheduleOption } = useRouting();
  if (!schedule.alternatives.length) return null;
  return <div className="schedule-alternatives"><fieldset><legend>Mejores horarios factibles</legend>
    {schedule.alternatives.map((option, index) => <label key={option.slot} className="schedule-option">
      <input type="radio" name="schedule-option" aria-label={`${index === 0 ? 'Opción recomendada' : 'Segunda alternativa factible'}: ${formatTime(option.slot)}`} checked={schedule.assignment?.slot === option.slot} onChange={() => selectScheduleOption(option.slot)} />
      <span><strong>{index === 0 ? 'Opción recomendada' : 'Segunda alternativa factible'}</strong><span>{formatTime(option.slot)}{Number(option.slot.split(':')[0]) >= 24 ? ' · día siguiente' : ''}</span><small>Costo del modelo: {option.cost.total.toFixed(3)}</small></span>
    </label>)}
    {schedule.alternatives.length < 2 && <small>No existe una segunda franja factible con las restricciones actuales.</small>}
    </fieldset><small>Solo se ofrecen franjas que respetan las restricciones del modelo. El costo no representa dinero.</small>
    {schedule.alternatives.some(option => Number(option.slot.split(':')[0]) % 24 < 6 || Number(option.slot.split(':')[0]) % 24 >= 22) && <small>Congestión nocturna: PARÁMETRO DEMO DEL MODELO, no una medición de tráfico.</small>}
    <details><summary>Referencia de carga y descarga</summary><p>{cajamarcaContext.loadingRegulation} No equivale a una prohibición general de circulación ni acredita permisos para el destino seleccionado.</p><a href={cajamarcaContext.loadingSourceUrl} target="_blank" rel="noreferrer">Comunicado municipal de referencia</a><p>Las referencias académicas diurnas se conservan. Las franjas de noche o madrugada solo se habilitan cuando la ventana de atención DEMO las admite.</p></details>
  </div>;
}
