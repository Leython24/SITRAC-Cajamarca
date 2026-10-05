export const costExplanation = 'El costo no representa dinero. SITRAC lo utiliza para comparar alternativas considerando distancia y congestión. Un valor menor representa una alternativa más conveniente dentro del modelo.';
export default function CostHelp() {
  return <span className="cost-help"><button type="button" aria-label="Qué significa el costo" title={costExplanation}>ⓘ</button><span role="tooltip">{costExplanation}</span></span>;
}
