import log from 'loglevel';

// Configurar o nível de log para mostrar todas as mensagens
log.setLevel('debug');

// Configurar prefixo personalizado para facilitar identificação
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  
  return function (message, ...args) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}]`;
    rawMethod.call(this, prefix, message, ...args);
  };
};

// Aplicar a configuração
log.setLevel(log.getLevel());

export default log; 