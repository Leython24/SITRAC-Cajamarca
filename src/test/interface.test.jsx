import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../app/router';

function open(path = '/') {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);
  return user;
}

describe('SITRAC · experiencia de planificación', () => {
  it('abre directamente el planificador y muestra la navegación compacta', () => {
    open();
    expect(screen.getByRole('heading', { name: 'Planificar viaje', level: 1 })).toBeVisible();
    const nav = within(screen.getAllByRole('navigation', { name: 'Navegación principal' })[1]);
    expect(nav.getAllByRole('link')).toHaveLength(3);
    expect(nav.getAllByRole('link', { name: 'Planificar' })[0]).toBeVisible();
  });

  it('permite elegir vehículo, horario, puntos amigables y calcular una ruta', async () => {
    const user = open('/planificar-viaje');
    await user.selectOptions(screen.getByLabelText('Vehículo para planificar'), 'C001');
    expect(screen.getByText(/Llega 7:15/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
    expect(screen.getByText(/Horario recomendado/)).toBeVisible();
    expect(screen.getByLabelText('Procedencia')).toHaveValue('costa');
    expect(screen.getByLabelText('Destino del viaje')).toHaveValue('G');
    expect(screen.queryByText(/^A$/)).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'CALCULAR RUTA' })[0]);
    expect(screen.getAllByText(/Ruta recomendada/).length).toBeGreaterThan(0);
  });

  it('ofrece selección segura en el mapa y controles opcionales desactivados', async () => {
    const user = open('/planificar-viaje');
    expect(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Capas ▾' })).toBeVisible();
    expect(screen.getAllByText(/Ingreso sur · origen de ejemplo/).length).toBeGreaterThan(0);
  });

  it('conserva transporte de carga y enlaza un vehículo a planificación', async () => {
    const user = open('/transporte-carga');
    await user.click(screen.getByRole('link', { name: 'Planificar viaje con C001' }));
    expect(screen.getByRole('heading', { name: 'Planificar viaje', level: 1 })).toBeVisible();
    expect(screen.getByLabelText('Vehículo para planificar')).toHaveValue('C001');
  });

  it('mantiene resultados y detalles técnicos disponibles', async () => {
    const user = open('/resultados');
    expect(screen.getByRole('heading', { name: 'Resultado del viaje' })).toBeVisible();
    await user.click(screen.getByText('Ver detalles técnicos'));
    expect(screen.getAllByText(/Dijkstra/).length).toBeGreaterThan(0);
  });
});
