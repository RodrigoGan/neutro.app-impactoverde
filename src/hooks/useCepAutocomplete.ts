import { useState, useEffect } from 'react';

export function useCepAutocomplete(initialCep = '') {
  const [cep, setCep] = useState(initialCep);
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsLoading(true);
      setError('');
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setLogradouro(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.localidade || '');
            setEstado(data.uf || '');
          } else {
            setError('CEP não encontrado.');
            setLogradouro('');
            setBairro('');
            setCidade('');
            setEstado('');
          }
        })
        .catch(() => {
          setError('Erro ao buscar CEP.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setLogradouro('');
      setBairro('');
      setCidade('');
      setEstado('');
      setError('');
    }
  }, [cep]);

  return {
    cep,
    setCep,
    logradouro,
    setLogradouro,
    bairro,
    setBairro,
    cidade,
    setCidade,
    estado,
    setEstado,
    isLoading,
    error
  };
} 