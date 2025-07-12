import { Notification } from '@/types/notification';

interface NeighborhoodUser {
  id: string;
  userType: Notification['userTypes'][number];
  neighborhoodId: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface CollectorSchedule {
  id: string;
  collectorId: string;
  neighborhoodId: string;
  date: string;
  period: 'manha' | 'tarde' | 'noite';
  status: 'disponivel' | 'ocupado';
}

export class NeighborhoodNotificationService {
  private static instance: NeighborhoodNotificationService;
  private users: NeighborhoodUser[] = [];
  private schedules: CollectorSchedule[] = [];

  private constructor() {}

  public static getInstance(): NeighborhoodNotificationService {
    if (!NeighborhoodNotificationService.instance) {
      NeighborhoodNotificationService.instance = new NeighborhoodNotificationService();
    }
    return NeighborhoodNotificationService.instance;
  }

  // Método para registrar um usuário no sistema
  public registerUser(user: NeighborhoodUser): void {
    this.users.push(user);
  }

  // Método para registrar um horário de coleta
  public registerSchedule(schedule: CollectorSchedule): void {
    this.schedules.push(schedule);
  }

  // Método para obter usuários de um bairro específico
  public getUsersByNeighborhood(neighborhoodId: string): NeighborhoodUser[] {
    return this.users.filter(user => user.neighborhoodId === neighborhoodId);
  }

  // Método para criar notificação de coleta no bairro
  public createNeighborhoodNotification(
    collectorId: string,
    neighborhoodId: string,
    date: string,
    period: 'manha' | 'tarde' | 'noite'
  ): Notification {
    const collector = this.getCollectorInfo(collectorId);
    const neighborhood = this.getNeighborhoodInfo(neighborhoodId);

    return {
      id: `coleta_${Date.now()}`,
      title: 'Coletor Disponível no Seu Bairro',
      description: `${collector.name} está disponível para coletas no seu bairro`,
      type: 'coleta_bairro',
      status: 'pendente',
      read: false,
      date: new Date().toISOString(),
      userTypes: ['common_user'],
      neighborhood: {
        id: neighborhoodId,
        name: neighborhood.name
      },
      collector: {
        id: collectorId,
        name: collector.name,
        rating: collector.rating
      },
      collectionDate: date,
      collectionPeriod: period
    };
  }

  // Método para enviar notificações para usuários do bairro
  public async sendNeighborhoodNotifications(
    collectorId: string,
    neighborhoodId: string,
    date: string,
    period: 'manha' | 'tarde' | 'noite'
  ): Promise<number> {
    try {
      // TODO: Implementar chamada real à API
      // Por enquanto, vamos simular o envio de notificações
      const notificationsSent = Math.floor(Math.random() * 20) + 5;

      // Simulando o tempo de resposta da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      return notificationsSent;
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      throw new Error('Falha ao enviar notificações para o bairro');
    }
  }

  public async getNeighborhoodNotifications(
    neighborhoodId: string,
    date: string,
    period: 'manha' | 'tarde' | 'noite'
  ): Promise<Notification[]> {
    try {
      // TODO: Implementar chamada real à API
      // Por enquanto, vamos retornar dados mockados
      return [
        {
          id: '1',
          type: 'neighborhood_collection',
          title: 'Coleta disponível no seu bairro',
          message: 'Um coletor está disponível para realizar coleta no seu bairro hoje.',
          date: new Date().toISOString(),
          status: 'unread',
          priority: 'high'
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw new Error('Falha ao buscar notificações do bairro');
    }
  }

  // Métodos auxiliares para simulação
  private getCollectorInfo(collectorId: string) {
    // Simulação - em produção, isso viria do banco de dados
    return {
      name: 'João Silva',
      rating: 4.8
    };
  }

  private getNeighborhoodInfo(neighborhoodId: string) {
    // Simulação - em produção, isso viria do banco de dados
    return {
      name: 'Jardim América'
    };
  }
} 