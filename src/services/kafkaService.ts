import { httpClient } from './api';

// Types for Kafka API responses
export interface TopicSuggestion {
  name: string;
  partitions: number;
  replicationFactor: number;
}

export interface KeyType {
  id: string;
  name: string;
  description: string;
}

export interface ValueType {
  id: string;
  name: string;
  description: string;
  contentType: string;
}

export interface PartitionerType {
  id: string;
  name: string;
  description: string;
}

export interface EventPublishRequest {
  topic: string;
  key?: {
    type: string;
    value: string;
  };
  value: {
    type: string;
    content: string;
  };
  headers?: Record<string, string>;
  partitioner?: {
    type: string;
  };
}

export interface EventPublishResponse {
  success: boolean;
  partition: number;
  offset: number;
  timestamp: number;
  messageId: string;
}

// Kafka Service Class
class KafkaService {
  // Get available topics with hardcoded values for now
  async getTopicSuggestions(): Promise<TopicSuggestion[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await httpClient.get<TopicSuggestion[]>('/topics');
      
      // Hardcoded values for now
      return Promise.resolve([
        { name: 'user-events', partitions: 3, replicationFactor: 2 },
        { name: 'order-events', partitions: 6, replicationFactor: 3 },
        { name: 'product-events', partitions: 3, replicationFactor: 2 },
        { name: 'payment-events', partitions: 6, replicationFactor: 3 },
        { name: 'notification-events', partitions: 2, replicationFactor: 2 },
        { name: 'audit-events', partitions: 12, replicationFactor: 3 },
        { name: 'analytics-events', partitions: 8, replicationFactor: 2 },
        { name: 'system-events', partitions: 4, replicationFactor: 2 },
      ]);
    } catch (error) {
      console.error('Failed to fetch topic suggestions:', error);
      // Return empty array on error
      return [];
    }
  }

  // Get available key types with hardcoded values for now
  async getKeyTypes(): Promise<KeyType[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await httpClient.get<KeyType[]>('/key-types');
      
      // Hardcoded values for now
      return Promise.resolve([
        { id: 'string', name: 'String', description: 'Plain text string key' },
        { id: 'uuid', name: 'UUID', description: 'Universally unique identifier' },
        { id: 'integer', name: 'Integer', description: 'Numeric integer key' },
        { id: 'long', name: 'Long', description: 'Long integer key' },
        { id: 'json', name: 'JSON', description: 'JSON formatted key' },
        { id: 'avro', name: 'Avro', description: 'Avro serialized key' },
      ]);
    } catch (error) {
      console.error('Failed to fetch key types:', error);
      return [];
    }
  }

  // Get available value types with hardcoded values for now
  async getValueTypes(): Promise<ValueType[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await httpClient.get<ValueType[]>('/value-types');
      
      // Hardcoded values for now
      return Promise.resolve([
        { id: 'json', name: 'JSON', description: 'JSON formatted message', contentType: 'application/json' },
        { id: 'string', name: 'String', description: 'Plain text message', contentType: 'text/plain' },
        { id: 'avro', name: 'Avro', description: 'Avro serialized message', contentType: 'application/avro' },
        { id: 'protobuf', name: 'Protocol Buffers', description: 'Protobuf serialized message', contentType: 'application/x-protobuf' },
        { id: 'xml', name: 'XML', description: 'XML formatted message', contentType: 'application/xml' },
        { id: 'binary', name: 'Binary', description: 'Binary data', contentType: 'application/octet-stream' },
      ]);
    } catch (error) {
      console.error('Failed to fetch value types:', error);
      return [];
    }
  }

  // Get available partitioner types with hardcoded values for now
  async getPartitionerTypes(): Promise<PartitionerType[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await httpClient.get<PartitionerType[]>('/partitioner-types');
      
      // Hardcoded values for now
      return Promise.resolve([
        { id: 'defined', name: 'Defined', description: 'Use explicitly defined partition based on key' },
        { id: 'random', name: 'Random', description: 'Randomly distribute messages across partitions' },
      ]);
    } catch (error) {
      console.error('Failed to fetch partitioner types:', error);
      return [];
    }
  }

  // Publish event to Kafka
  async publishEvent(request: EventPublishRequest): Promise<EventPublishResponse> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await httpClient.post<EventPublishResponse>('/events/publish', request);
      
      // Mock response for now
      return Promise.resolve({
        success: true,
        partition: Math.floor(Math.random() * 6),
        offset: Math.floor(Math.random() * 1000000),
        timestamp: Date.now(),
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  // Get topic details
  async getTopicDetails(topicName: string): Promise<TopicSuggestion | null> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // return await httpClient.get<TopicSuggestion>(`/topics/${topicName}`);
      
      const topics = await this.getTopicSuggestions();
      return topics.find(topic => topic.name === topicName) || null;
    } catch (error) {
      console.error('Failed to fetch topic details:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const kafkaService = new KafkaService();
export default kafkaService;
