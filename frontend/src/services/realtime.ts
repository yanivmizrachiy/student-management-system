import { io, Socket } from 'socket.io-client';
import api from './api';

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = this.getToken();
    if (!token) {
      console.warn('No token found, cannot connect to WebSocket');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.socket = io(apiUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Set up listeners for all registered callbacks
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  private getToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (e) {
      console.error('Error reading token from storage:', e);
    }
    return null;
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  unsubscribe(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach((cb) => {
          if (this.socket) {
            this.socket.off(event, cb);
          }
        });
      }
      this.listeners.delete(event);
    }
  }

  subscribeGrades(callback: Function) {
    this.connect();
    this.subscribe('grades:updated', callback);
    this.subscribe('grade:updated', callback);
    if (this.socket?.connected) {
      this.socket.emit('subscribe:grades');
    }
  }

  subscribeGroups(gradeId: string | undefined, callback: Function) {
    this.connect();
    this.subscribe('groups:updated', callback);
    this.subscribe('group:updated', callback);
    if (this.socket?.connected) {
      this.socket.emit('subscribe:groups', { gradeId });
    }
  }

  subscribeStudents(
    gradeId: string | undefined,
    groupId: string | undefined,
    callback: Function,
  ) {
    this.connect();
    this.subscribe('students:updated', callback);
    this.subscribe('student:updated', callback);
    if (this.socket?.connected) {
      this.socket.emit('subscribe:students', { gradeId, groupId });
    }
  }

  subscribeReports(callback: Function) {
    this.connect();
    this.subscribe('reports:updated', callback);
    if (this.socket?.connected) {
      this.socket.emit('subscribe:reports');
    }
  }
}

export const realtimeService = new RealtimeService();
