export default function OptionChecklist({ options, selected, onChange, label }) {
  return <fieldset className="option-checklist"><legend className="sr-only">{label}</legend>{options.map(option => <label key={option.id} className={selected.includes(option.id) ? 'checked' : ''}><input type="checkbox" checked={selected.includes(option.id)} onChange={() => onChange(selected.includes(option.id) ? selected.filter(id => id !== option.id) : [...selected, option.id])} /><span><strong>{option.label}</strong>{option.detail && <small>{option.detail}</small>}</span></label>)}</fieldset>;
}
