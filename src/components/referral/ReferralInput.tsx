import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReferralService } from '@/services/ReferralService';
import { Gift, CheckCircle, XCircle, Info } from 'lucide-react';

interface ReferralInputProps {
  onReferralCodeChange: (code: string | null) => void;
  initialCode?: string;
}

export const ReferralInput: React.FC<ReferralInputProps> = ({
  onReferralCodeChange,
  initialCode
}) => {
  const [code, setCode] = useState(initialCode || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    referrerId?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (initialCode) {
      validateCode(initialCode);
    }
  }, [initialCode]);

  const validateCode = async (inputCode: string) => {
    if (!inputCode.trim()) {
      setValidationResult(null);
      onReferralCodeChange(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await ReferralService.validateReferralCode(inputCode.trim());
      setValidationResult({
        valid: result.valid,
        referrerId: result.referrerId,
        message: result.valid 
          ? 'Código válido! Você ganhará pontos extras.' 
          : 'Código inválido ou expirado.'
      });
      
      if (result.valid) {
        onReferralCodeChange(inputCode.trim());
      } else {
        onReferralCodeChange(null);
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Erro ao validar código. Tente novamente.'
      });
      onReferralCodeChange(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.toUpperCase();
    setCode(newCode);
    
    // Validar após um pequeno delay para evitar muitas requisições
    const timeoutId = setTimeout(() => {
      validateCode(newCode);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleClearCode = () => {
    setCode('');
    setValidationResult(null);
    onReferralCodeChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Código de Indicação (Opcional)
        </CardTitle>
        <CardDescription>
          Tem um código de indicação? Use-o para ganhar pontos extras!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Campo de entrada */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Código de Indicação
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Digite o código (ex: ABC12345)"
              value={code}
              onChange={handleCodeChange}
              className="font-mono text-center"
              maxLength={8}
              disabled={isValidating}
            />
            {code && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCode}
                disabled={isValidating}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Status da validação */}
        {isValidating && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Validando código...</span>
          </div>
        )}

        {validationResult && !isValidating && (
          <Alert className={validationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={validationResult.valid ? 'text-green-800' : 'text-red-800'}>
                {validationResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Benefícios */}
        {validationResult?.valid && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700">
              <Gift className="h-4 w-4" />
              Benefícios da Indicação
            </h4>
            <ul className="text-sm space-y-1 text-green-700">
              <li>• 50 pontos extras para você</li>
              <li>• 50 pontos para quem te indicou</li>
              <li>• Acesso a cupons exclusivos</li>
              <li>• Progresso mais rápido nos níveis</li>
            </ul>
          </div>
        )}

        {/* Informações gerais */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como funciona:</p>
              <ul className="space-y-1 text-xs">
                <li>• Peça um código para um amigo que já usa o Neutro</li>
                <li>• Digite o código durante seu cadastro</li>
                <li>• Ambos ganham pontos quando você completar o registro</li>
                <li>• Não tem código? Sem problemas! Você pode se cadastrar normalmente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exemplo de código */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Exemplo de código:</p>
          <div className="inline-block p-2 bg-gray-100 rounded font-mono text-sm">
            ABC12345
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 