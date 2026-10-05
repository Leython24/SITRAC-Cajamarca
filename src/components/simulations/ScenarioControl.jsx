export default function ScenarioControl({ step, title, description, status, children }) {
  return <fieldset className="scenario-control"><legend><span className="step-number">{step}</span>{title}</legend><div className="scenario-control-heading"><p>{description}</p>{status && <span>{status}</span>}</div>{children}</fieldset>;
}
