import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../app/router';

function open() {
  render(<MemoryRouter initialEntries={['/planificar-viaje']}><AppRoutes /></MemoryRouter>);
  return userEvent.setup();
}

describe('Planificar viaje · experiencia guiada', () => {
  it('presenta el flujo horario, ruta y problema sin IDs técnicos', async () => {
    const user = open();
    expect(screen.getByRole('heading', { name: 'Planificar viaje', level: 1 })).toBeVisible();
    expect(screen.getByLabelText('Vehículo para planificar')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'RECOMENDAR HORARIO' }));
    expect(screen.getByText(/Horario recomendado/)).toBeVisible();
    expect(screen.getByLabelText('Procedencia')).toBeVisible();
    expect(screen.queryByText(/^A$/)).not.toBeInTheDocument();
  });

  it('mantiene los controles de exposición y el cierre de una vía en la ruta legacy', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/simulaciones']}><AppRoutes /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'MODO EXPOSICIÓN' }));
    expect(screen.getByText('Paso 1 de 12')).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Planificar' })[0]).toBeVisible();
  });
});
