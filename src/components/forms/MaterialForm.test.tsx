import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MaterialForm } from './MaterialForm';

// Mock do hook useMaterials
vi.mock('@/hooks/useMaterials', () => ({
  useMaterials: () => ({
    materials: [
      { id: 'papel', nome: 'Papel/Papelão' },
      { id: 'plastico', nome: 'Plástico' },
      { id: 'outros', nome: 'Outros (especificar)' }
    ],
    loading: false,
    error: null
  })
}));

describe('MaterialForm', () => {
  it('deve renderizar o formulário com todos os campos', () => {
    const onAddMaterial = vi.fn();
    const onClose = vi.fn();
    
    render(<MaterialForm onAddMaterial={onAddMaterial} onClose={onClose} />);

    // Verifica se os campos principais estão presentes
    expect(screen.getByText('Tipo de Material')).toBeInTheDocument();
    expect(screen.getByText('Quantidade')).toBeInTheDocument();
    expect(screen.getByText('Unidade')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar Material/i })).toBeInTheDocument();
  });

  it('deve ter campos de input funcionais', () => {
    const onAddMaterial = vi.fn();
    const onClose = vi.fn();
    
    render(<MaterialForm onAddMaterial={onAddMaterial} onClose={onClose} />);

    // Verifica se o input de quantidade está presente
    const quantidadeInput = screen.getByLabelText('Quantidade');
    expect(quantidadeInput).toBeInTheDocument();
    expect(quantidadeInput).toHaveAttribute('type', 'number');
  });

  it('deve ter selects customizados', () => {
    const onAddMaterial = vi.fn();
    const onClose = vi.fn();
    
    render(<MaterialForm onAddMaterial={onAddMaterial} onClose={onClose} />);

    // Verifica se os selects estão presentes (como combobox)
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2); // Tipo de material e unidade
  });
}); 