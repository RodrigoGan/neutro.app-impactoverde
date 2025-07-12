import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Logo from './Logo';

describe('Logo', () => {
  it('deve renderizar o logo com alt correto', () => {
    render(<Logo />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt');
  });
}); 