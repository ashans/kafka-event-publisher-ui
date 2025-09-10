import React, { useState, useEffect } from 'react';
import { FormData, Header } from './Layout';
import './MainContent.css';
import { 
  IoSendOutline, 
  IoTrashOutline,
  IoAddOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { kafkaService, TopicSuggestion, KeyType, ValueType, PartitionerType } from '../services/kafkaService';

interface MainContentProps {
  selectedItem: string;
  formData?: FormData;
  eventName?: string;
  onFormDataUpdate: (itemId: string, field: keyof FormData, value: string | Header[]) => void;
  onEventNameUpdate: (itemId: string, newName: string) => void;
  onHeaderAdd: (itemId: string) => void;
  onHeaderUpdate: (itemId: string, headerId: string, field: 'key' | 'value', value: string) => void;
  onHeaderDelete: (itemId: string, headerId: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  selectedItem, 
  formData, 
  eventName = '',
  onFormDataUpdate,
  onEventNameUpdate,
  onHeaderAdd,
  onHeaderUpdate,
  onHeaderDelete
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(eventName);
  const [isJsonFormatting, setIsJsonFormatting] = useState(false);
  
  // State for data from Kafka service
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestion[]>([]);
  const [keyTypes, setKeyTypes] = useState<KeyType[]>([]);
  const [valueTypes, setValueTypes] = useState<ValueType[]>([]);
  const [partitionerTypes, setPartitionerTypes] = useState<PartitionerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch data from Kafka service on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [topics, keyTypesData, valueTypesData, partitionerTypesData] = await Promise.all([
          kafkaService.getTopicSuggestions(),
          kafkaService.getKeyTypes(),
          kafkaService.getValueTypes(),
          kafkaService.getPartitionerTypes(),
        ]);
        
        setTopicSuggestions(topics);
        setKeyTypes(keyTypesData);
        setValueTypes(valueTypesData);
        setPartitionerTypes(partitionerTypesData);
      } catch (error) {
        console.error('Failed to fetch data from Kafka service:', error);
        // Set empty arrays on error so the UI still works
        setTopicSuggestions([]);
        setKeyTypes([]);
        setValueTypes([]);
        setPartitionerTypes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (selectedItem === 'add-new' || !formData) {
    return (
      <main className="main-content">
        <div className="content-container">
          <div>
            <h1>Add New Event</h1>
            <p>Click the "Add New Event" button in the sidebar to create a new event form.</p>
          </div>
        </div>
      </main>
    );
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    onFormDataUpdate(selectedItem, field, value);
  };

  const handleNameClick = () => {
    setIsEditingName(true);
    setTempName(eventName);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (tempName.trim() && tempName !== eventName) {
      onEventNameUpdate(selectedItem, tempName.trim());
    } else {
      setTempName(eventName);
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setTempName(eventName);
    }
  };

  const formatJson = (value: string): string => {
    if (!value.trim()) return value;
    
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      // If parsing fails, return original value
      return value;
    }
  };

  const handleJsonFormattingToggle = (checked: boolean) => {
    setIsJsonFormatting(checked);
    
    if (checked && formData) {
      // Format the current value as JSON
      const formattedValue = formatJson(formData.value);
      if (formattedValue !== formData.value) {
        handleInputChange('value', formattedValue);
      }
    }
  };

  const handlePayloadChange = (value: string) => {
    handleInputChange('value', value);
  };

  const handlePayloadBlur = () => {
    if (isJsonFormatting && formData) {
      const formattedValue = formatJson(formData.value);
      if (formattedValue !== formData.value) {
        handleInputChange('value', formattedValue);
      }
    }
  };

  const handlePayloadKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isJsonFormatting && (e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      if (formData) {
        const formattedValue = formatJson(formData.value);
        handleInputChange('value', formattedValue);
      }
    }
  };

  const handlePublishEvent = async () => {
    if (!formData || !formData.topic) {
      alert('Please enter a topic name');
      return;
    }

    if (!formData.valueType) {
      alert('Please select a value type');
      return;
    }

    if (!formData.partitionerType) {
      alert('Please select a partitioner type');
      return;
    }

    try {
      setIsPublishing(true);
      
      const request = {
        topic: formData.topic,
        key: formData.keyValue ? {
          type: formData.keyType,
          value: formData.keyValue
        } : undefined,
        value: {
          type: formData.valueType,
          content: formData.value
        },
        headers: formData.headers.reduce((acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        }, {} as Record<string, string>),
        partitioner: {
          type: formData.partitionerType
        }
      };

      const response = await kafkaService.publishEvent(request);
      
      if (response.success) {
        alert(`Event published successfully!\nPartition: ${response.partition}\nOffset: ${response.offset}\nMessage ID: ${response.messageId}`);
      } else {
        alert('Failed to publish event');
      }
    } catch (error) {
      console.error('Failed to publish event:', error);
      alert('Failed to publish event. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      onFormDataUpdate(selectedItem, 'topic', '');
      onFormDataUpdate(selectedItem, 'keyType', '');
      onFormDataUpdate(selectedItem, 'keyValue', '');
      onFormDataUpdate(selectedItem, 'valueType', '');
      onFormDataUpdate(selectedItem, 'value', '');
      onFormDataUpdate(selectedItem, 'partitionerType', '');
      onFormDataUpdate(selectedItem, 'headers', []);
      setIsJsonFormatting(false);
    }
  };

  return (
    <main className="main-content">
      <div className="content-container">
        <div className="form-header">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyPress}
              className="event-name-input"
              autoFocus
            />
          ) : (
            <h1 
              className="event-name-title"
              onClick={handleNameClick}
              title="Click to edit event name"
            >
              {eventName || 'Untitled Event'}
            </h1>
          )}
          {isLoading && (
            <div className="loading-indicator">
              <span>Loading form data...</span>
            </div>
          )}
        </div>
        
        <form className="event-form">
          <div className="form-columns">
            <div className="form-column-left">
              {/* Topic Section */}
              <div className="form-section">
                <h3 className="section-title">Topic</h3>
                <input
                  type="text"
                  className="form-input"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder={isLoading ? "Loading topics..." : "Enter Kafka topic name"}
                  list="topic-suggestions"
                  disabled={isLoading}
                />
                <datalist id="topic-suggestions">
                  {topicSuggestions.map((topic) => (
                    <option key={topic.name} value={topic.name} />
                  ))}
                </datalist>
              </div>

              {/* Headers Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Headers</h3>
                  <button 
                    type="button" 
                    className="btn-icon btn-add"
                    onClick={() => onHeaderAdd(selectedItem)}
                    title="Add header"
                  >
                    <IoAddOutline />
                  </button>
                </div>
                <div className="headers-list">
                  {formData.headers.map((header) => (
                    <div key={header.id} className="header-row">
                      <input
                        type="text"
                        className="form-input header-key"
                        value={header.key}
                        onChange={(e) => onHeaderUpdate(selectedItem, header.id, 'key', e.target.value)}
                        placeholder="Key"
                      />
                      <input
                        type="text"
                        className="form-input header-value"
                        value={header.value}
                        onChange={(e) => onHeaderUpdate(selectedItem, header.id, 'value', e.target.value)}
                        placeholder="Value"
                      />
                      <button 
                        type="button" 
                        className="btn-icon btn-delete"
                        onClick={() => onHeaderDelete(selectedItem, header.id)}
                        title="Delete header"
                      >
                        <IoCloseOutline />
                      </button>
                    </div>
                  ))}
                  {formData.headers.length === 0 && (
                    <p className="empty-state">No headers added. Click + to add headers.</p>
                  )}
                </div>
              </div>

              {/* Key Section */}
              <div className="form-section">
                <h3 className="section-title">Key</h3>
                <div className="key-fields">
                  <select
                    className="form-select key-type"
                    value={formData.keyType}
                    onChange={(e) => handleInputChange('keyType', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select key type</option>
                    {isLoading ? (
                      <option value="" disabled>Loading...</option>
                    ) : keyTypes.length > 0 ? (
                      keyTypes.map((keyType) => (
                        <option key={keyType.id} value={keyType.id}>
                          {keyType.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="json">JSON</option>
                      </>
                    )}
                  </select>
                  <input
                    type="text"
                    className="form-input key-value"
                    value={formData.keyValue}
                    onChange={(e) => handleInputChange('keyValue', e.target.value)}
                    placeholder="Enter key value"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Value Type Section */}
              <div className="form-section">
                <h3 className="section-title">Value Type</h3>
                <select
                  className="form-select value-type"
                  value={formData.valueType}
                  onChange={(e) => handleInputChange('valueType', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select value type</option>
                  {isLoading ? (
                    <option value="" disabled>Loading...</option>
                  ) : valueTypes.length > 0 ? (
                    valueTypes.map((valueType) => (
                      <option key={valueType.id} value={valueType.id}>
                        {valueType.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="json">JSON</option>
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="binary">Binary</option>
                    </>
                  )}
                </select>
              </div>

              {/* Partitioner Section */}
              <div className="form-section">
                <h3 className="section-title">Partitioner</h3>
                <select
                  className="form-select partitioner-type"
                  value={formData.partitionerType}
                  onChange={(e) => handleInputChange('partitionerType', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select partitioner</option>
                  {isLoading ? (
                    <option value="" disabled>Loading...</option>
                  ) : partitionerTypes.length > 0 ? (
                    partitionerTypes.map((partitionerType) => (
                      <option key={partitionerType.id} value={partitionerType.id}>
                        {partitionerType.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="defined">Defined</option>
                      <option value="random">Random</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-column-right">
              {/* Payload Section */}
              <div className="form-section form-section-expandable">
                <div className="payload-header">
                  <h3 className="section-title">Payload</h3>
                  <label className="json-format-checkbox">
                    <input
                      type="checkbox"
                      checked={isJsonFormatting}
                      onChange={(e) => handleJsonFormattingToggle(e.target.checked)}
                    />
                    <span className="checkbox-label">Format as JSON</span>
                  </label>
                </div>
                <textarea
                  className={`form-textarea form-textarea-expandable ${isJsonFormatting ? 'json-formatted' : ''}`}
                  value={formData.value}
                  onChange={(e) => handlePayloadChange(e.target.value)}
                  onBlur={handlePayloadBlur}
                  onKeyDown={handlePayloadKeyDown}
                  placeholder={isJsonFormatting ? 'Enter JSON payload (will be auto-formatted)' : 'Enter event payload'}
                  spellCheck={false}
                  title={isJsonFormatting ? 'JSON formatting enabled. Use Ctrl+F (Cmd+F) to format, or formatting will happen on blur.' : undefined}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={handleClearForm}
              disabled={isLoading || isPublishing}
            >
              <IoTrashOutline />
              Clear Form
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handlePublishEvent}
              disabled={isLoading || isPublishing || !formData.topic || !formData.valueType || !formData.partitionerType}
            >
              <IoSendOutline />
              {isPublishing ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default MainContent;
