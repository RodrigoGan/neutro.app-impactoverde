import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useZxing } from 'react-zxing';

// Mock de cupons válidos
const mockCoupons = [
  {
    code: 'MB-A1B2C3',
    name: 'Martião bom',
    partner: 'Restaurante Bom',
    value: 'R$ 10',
    expiresAt: '30/05/2025',
    status: 'ativo',
    user: 'João da Silva',
  },
  {
    code: 'LO-1X2Y3Z',
    name: 'Desconto Loja',
    partner: 'Loja Verde',
    value: '15% OFF',
    expiresAt: '15/06/2025',
    status: 'usado',
    user: 'Maria Souza',
  },
];

interface ValidateCouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ValidateCouponModal: React.FC<ValidateCouponModalProps> = ({ open, onOpenChange }) => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [purchaseValue, setPurchaseValue] = useState('');
  const [purchaseValueError, setPurchaseValueError] = useState<string | null>(null);

  // Sempre que o modal abrir, resetar scanning e forçar recriação do vídeo
  useEffect(() => {
    if (open) {
      setScanning(true);
      setVideoKey(prev => prev + 1); // força o React a recriar o <video>
      setError(null);
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Vídeo montado no DOM:', videoRef.current);
        } else {
          console.warn('Vídeo NÃO montado no DOM');
        }
      }, 500);
    }
  }, [open]);

  // Tentar constraints alternativas
  const constraints = [
    { video: { facingMode: { ideal: 'environment' } }, audio: false },
    { video: true, audio: false },
  ];
  const [constraintIndex, setConstraintIndex] = useState(0);

  const { ref } = useZxing({
    paused: !scanning,
    constraints: constraints[constraintIndex],
    onDecodeResult: (result) => {
      if (scanning) {
        setInputCode(result.getText());
        setScanning(false);
        setTimeout(() => handleValidate(), 300);
      }
    },
    onError: (err) => {
      console.error('Erro ao acessar a câmera ou ler o QR Code:', err);
      setError('Erro ao acessar a câmera ou ler o QR Code.\nVerifique se você liberou a câmera para este site nas configurações do navegador.\n' + (typeof err === 'object' && err && 'message' in err ? ('\n' + (err as any).message) : (typeof err === 'string' ? ('\n' + err) : '')));
      setScanning(false);
      // Tentar constraint alternativa se ainda não tentou
      if (constraintIndex === 0) {
        setConstraintIndex(1);
        setTimeout(() => setScanning(true), 300); // tenta novamente
      }
    },
  });

  function handleValidate() {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const found = mockCoupons.find(c => c.code.toUpperCase() === inputCode.trim().toUpperCase());
      setLoading(false);
      if (found) {
        setResult(found);
      } else {
        setResult(null);
        setError('Cupom não encontrado ou inválido.');
      }
    }, 1000);
  }

  function handleClose() {
    setInputCode('');
    setResult(null);
    setError(null);
    setLoading(false);
    setScanning(true);
    setVideoKey(prev => prev + 1);
    setConstraintIndex(0);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Validar Cupom</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Mensagem de orientação */}
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded p-2">
            <AlertCircle className="text-yellow-600 h-5 w-5" />
            <span className="font-semibold text-yellow-800">Valide o cupom somente após o fechamento da compra.</span>
          </div>
          {/* Leitor de QR Code real com react-zxing */}
          <div className="flex flex-col items-center gap-2">
            {scanning && (
              <div className="w-full flex flex-col items-center">
                <video ref={el => { if (ref && typeof ref === 'object') (ref as any).current = el; videoRef.current = el; }} key={videoKey} className="w-full rounded" style={{ maxHeight: 240 }} />
                <span className="text-sm text-muted-foreground mt-2">Aponte a câmera para o QR Code ou digite o código abaixo</span>
              </div>
            )}
            {!scanning && (
              <Button variant="outline" size="sm" onClick={() => { setScanning(true); setInputCode(''); setResult(null); setError(null); setVideoKey(prev => prev + 1); }}>
                Ler outro QR Code
              </Button>
            )}
          </div>
          {/* Campo para digitar código */}
          <Input
            placeholder="Digite o código do cupom"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleValidate()}
            disabled={loading}
          />
          <Button onClick={handleValidate} disabled={loading || !inputCode} className="w-full">
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Validar
          </Button>
          {/* Resultado da validação */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="text-green-600 h-5 w-5" />
                <span className="font-semibold text-green-700">Cupom válido!</span>
                <Badge variant="outline" className="ml-auto">{result.status === 'usado' ? 'Usado' : 'Ativo'}</Badge>
              </div>
              <div className="text-sm">
                <div><b>Nome:</b> {result.name}</div>
                <div><b>Parceiro:</b> {result.partner}</div>
                <div><b>Valor:</b> {result.value}</div>
                <div><b>Válido até:</b> {result.expiresAt}</div>
                <div><b>Usuário:</b> {result.user}</div>
              </div>
              {/* Campo para valor total da compra */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Valor total da compra (após desconto do cupom)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 120.50"
                  value={purchaseValue}
                  onChange={e => {
                    setPurchaseValue(e.target.value);
                    setPurchaseValueError(null);
                  }}
                  className={purchaseValueError ? 'border-red-500' : ''}
                />
                {purchaseValueError && <span className="text-xs text-red-600">{purchaseValueError}</span>}
              </div>
              <Button
                className="w-full mt-3"
                onClick={() => {
                  if (!purchaseValue || isNaN(Number(purchaseValue)) || Number(purchaseValue) <= 0) {
                    setPurchaseValueError('Informe um valor válido.');
                    return;
                  }
                  // Aqui segue o fluxo de confirmação/finalização
                  handleClose();
                }}
              >
                Confirmar
              </Button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2 flex items-center gap-2">
              <XCircle className="text-red-600 h-5 w-5" />
              <span className="text-red-700 font-semibold" style={{ whiteSpace: 'pre-line' }}>{error}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValidateCouponModal; 