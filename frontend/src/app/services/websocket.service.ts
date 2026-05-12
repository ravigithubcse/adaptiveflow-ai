import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { RealTimeUpdate } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private updateSubject = new Subject<RealTimeUpdate>();

  public updates$: Observable<RealTimeUpdate> = this.updateSubject.asObservable();

  connect(): void {
    const socket = new SockJS(environment.wsUrl);
    this.client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.subscribeToTopics();
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
      onWebSocketClose: () => {
        console.warn('WebSocket closed');
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnect attempts reached');
        }
      }
    });
    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
  }

  private subscribeToTopics(): void {
    if (!this.client) return;
    const topics = ['events', 'anomalies', 'predictions', 'actions', 'dashboard', 'copilot'];
    topics.forEach(topic => {
      this.client!.subscribe(`/topic/${topic}`, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          this.updateSubject.next(body);
        } catch (e) {
          console.error('Failed to parse message', e);
        }
      });
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
