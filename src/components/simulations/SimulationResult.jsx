import Panel from '../ui/Panel';
import RoutingPanel from '../optimization/RoutingPanel';

export default function SimulationResult() {
  return <Panel className="simulation-result"><RoutingPanel variant="simulation" /></Panel>;
}
