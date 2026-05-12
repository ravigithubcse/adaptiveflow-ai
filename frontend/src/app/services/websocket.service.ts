import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
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
    try {
      // Build broker URL: convert http(s) → ws(s), append /ws/websocket for SockJS-style fallback
      const brokerURL = environment.wsUrl
        .replace(/^https:\/\//, 'wss://')
        .replace(/^http:\/\//, 'ws://');

      this.client = new Client({
        brokerURL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.subscribeToTopics();
        },
        onStompError: (frame) => {
          console.warn('STOMP error', frame);
        },
        onWebSocketError: (event) => {
          console.warn('WebSocket error – real-time updates unavailable', event);
        },
        onWebSocketClose: () => {
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('WebSocket: max reconnect attempts reached, giving up');
          }
        }
      });

      this.client.activate();
    } catch (err) {
      console.warn('WebSocket init failed (non-fatal):', err);
    }
  }

  disconnect(): void {
    try {
      this.client?.deactivate();
    } catch (err) {
      // ignore
    }
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
          console.warn('Failed to parse WS message', e);
        }
      });
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
