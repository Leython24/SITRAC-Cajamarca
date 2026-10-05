import { useEffect, useRef } from 'react';
import Icon from '../ui/Icon';
import Notice from '../ui/Notice';

export default function AssistantPanel({ open, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  return <dialog id="assistant-panel" ref={dialog} className="assistant-panel" aria-labelledby="assistant-title" onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="assistant-inner">
      <header><h2 id="assistant-title"><Icon name="auto_awesome" />Asistente SITRAC</h2><button className="icon-button" aria-label="Cerrar asistente" onClick={onClose}><Icon name="close" /></button></header>
      <div className="assistant-body">
        <span className="eyebrow">Vista previa · Fase 1</span>
        <div className="assistant-message">El asistente SITRAC estará disponible en una fase posterior.</div>
        <p>Aquí podrás consultar e interpretar los resultados del sistema cuando se incorpore el modelo.</p>
        <Notice>Por ahora este panel es una maqueta visual. No envía mensajes ni genera respuestas mediante IA.</Notice>
      </div>
      <div className="assistant-input"><input aria-label="Mensaje al asistente" placeholder="Disponible en una fase posterior" disabled /><button className="icon-button" aria-label="Enviar mensaje (no disponible)" disabled><Icon name="send" /></button></div>
    </div>
  </dialog>;
}
