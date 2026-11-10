import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../docs/design/app.jsx';

describe('application shell', () => {
  it('renders dashboard navigation and Indonesian interface', () => {
    render(<App />);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getByText('Mode Offline')).toBeInTheDocument();
  });

  it('opens product screen from navigation', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<App />);

    await user.click(screen.getAllByRole('button', { name: /produk/i })[0]);

    expect(screen.getByRole('heading', { name: 'Master Produk' })).toBeInTheDocument();
  });
});
