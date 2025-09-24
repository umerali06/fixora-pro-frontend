import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../store/slices/notificationSlice';
import { updateDashboardData } from '../store/slices/dashboardSlice';
import { setSelectedCustomer } from '../store/slices/customersSlice';
import { setSelectedItem } from '../store/slices/inventorySlice';
import { updateRepairTicket } from '../store/slices/repairTicketsSlice';
import { updateInvoice } from '../store/slices/invoicesSlice';

export interface RealTimeEvent {
  type: string;
  entity: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
  userId?: string;
}

export interface RealTimeConfig {
  url: string;
  autoConnect: boolean;
  reconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
}

class RealTimeService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  connect(url: string = 'http://localhost:5000') {
    if (this.socket?.connected || this.isConnecting) {
      console.log('Socket already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000
      });

      this.setupEventListeners();
      console.log('RealTimeService: Connecting to', url);
    } catch (error) {
      console.error('RealTimeService: Connection failed', error);
      this.isConnecting = false;
      this.showNotification('Real-time connection failed', 'error');
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('RealTimeService: Connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.showNotification('Real-time connection established', 'success');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('RealTimeService: Disconnected', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.socket?.connect();
      }
      this.showNotification('Real-time connection lost', 'warning');
    });

    this.socket.on('connect_error', (error) => {
      console.error('RealTimeService: Connection error', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.showNotification('Real-time connection failed after multiple attempts', 'error');
      } else {
        this.showNotification(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'info');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('RealTimeService: Reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
      this.showNotification('Real-time connection restored', 'success');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('RealTimeService: Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('RealTimeService: Reconnection error', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('RealTimeService: Reconnection failed');
      this.showNotification('Real-time connection permanently lost', 'error');
    });

    // Dashboard updates
    this.socket.on('dashboard:stats:update', (data) => {
      store.dispatch(updateDashboardData(data));
    });

    this.socket.on('dashboard:repair-status:update', (data) => {
      // Handle repair status updates - could be handled by specific slice
      this.showNotification('Repair status updated', 'info');
    });

    // Customer updates
    this.socket.on('customer:created', (data) => {
      this.showNotification('New customer added', 'success');
    });

    this.socket.on('customer:updated', (data) => {
      store.dispatch(setSelectedCustomer(data));
      this.showNotification('Customer updated', 'info');
    });

    this.socket.on('customer:deleted', (data) => {
      this.showNotification('Customer removed', 'warning');
    });

    // Device updates
    this.socket.on('device:created', (data) => {
      this.showNotification('New device added', 'success');
    });

    this.socket.on('device:updated', (data) => {
      this.showNotification('Device updated', 'info');
    });

    this.socket.on('device:deleted', (data) => {
      this.showNotification('Device removed', 'warning');
    });

    // Repair ticket updates
    this.socket.on('repair-ticket:created', (data) => {
      this.showNotification('New repair ticket created', 'success');
    });

    this.socket.on('repair-ticket:updated', (data) => {
      store.dispatch(updateRepairTicket(data));
      this.showNotification('Repair ticket updated', 'info');
    });

    this.socket.on('repair-ticket:deleted', (data) => {
      this.showNotification('Repair ticket removed', 'warning');
    });

    // Inventory updates
    this.socket.on('inventory:created', (data) => {
      this.showNotification('New inventory item added', 'success');
    });

    this.socket.on('inventory:updated', (data) => {
      store.dispatch(setSelectedItem(data));
      this.showNotification('Inventory item updated', 'info');
    });

    this.socket.on('inventory:deleted', (data) => {
      this.showNotification('Inventory item removed', 'warning');
    });

    // Invoice updates
    this.socket.on('invoice:created', (data) => {
      this.showNotification('New invoice created', 'success');
    });

    this.socket.on('invoice:updated', (data) => {
      store.dispatch(updateInvoice(data));
      this.showNotification('Invoice updated', 'info');
    });

    this.socket.on('invoice:deleted', (data) => {
      this.showNotification('Invoice removed', 'warning');
    });

    // POS updates
    this.socket.on('pos:order:created', (data) => {
      this.showNotification('New POS order created', 'success');
    });

    this.socket.on('pos:order:updated', (data) => {
      this.showNotification('POS order updated', 'info');
    });

    this.socket.on('pos:order:deleted', (data) => {
      this.showNotification('POS order removed', 'warning');
    });

    // System notifications
    this.socket.on('system:notification', (data) => {
      this.showNotification(data.message, data.type || 'info');
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('RealTimeService: Socket error', error);
      this.showNotification('Real-time connection error', 'error');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('RealTimeService: Disconnected');
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('RealTimeService: Cannot emit event, socket not connected');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 4000): void {
    store.dispatch(addNotification({
      title: 'System Notification',
      message,
      type,
      duration
    }));
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }
}

// Export singleton instance
const realTimeService = new RealTimeService();
export default realTimeService;
