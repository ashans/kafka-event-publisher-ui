import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import './Layout.css';
import { SiApachekafka } from 'react-icons/si';

// Storage keys for persistence
const STORAGE_KEYS = {
  SELECTED_ITEM: 'kafka-ui-selected-item',
  DARK_MODE: 'kafka-ui-dark-mode',
  MENU_ITEMS: 'kafka-ui-menu-items',
  FORM_DATA: 'kafka-ui-form-data',
};

// Utility functions for localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = function<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Utility to clear all app data (useful for debugging)
export const clearAllStoredData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All stored data cleared');
};

// Make clearAllStoredData available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearKafkaUIData = clearAllStoredData;
}

export interface MenuItem {
  id: string;
  name: string;
  type: 'data' | 'add-new';
}

export interface Header {
  id: string;
  key: string;
  value: string;
}

export interface FormData {
  id: string;
  topic: string;
  headers: Header[];
  keyType: string;
  keyValue: string;
  valueType: string;
  value: string;
  partitionerType: string;
}

const Layout: React.FC = () => {
  // Initialize state with persisted data
  const [selectedItem, setSelectedItem] = useState<string>(() => 
    loadFromStorage(STORAGE_KEYS.SELECTED_ITEM, 'item-1')
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
    loadFromStorage(STORAGE_KEYS.DARK_MODE, false)
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => 
    loadFromStorage(STORAGE_KEYS.MENU_ITEMS, [
      { id: 'item-1', name: 'Event 1', type: 'data' },
      { id: 'add-new', name: '', type: 'add-new' }
    ])
  );
  const [formDataList, setFormDataList] = useState<FormData[]>(() => 
    loadFromStorage(STORAGE_KEYS.FORM_DATA, [
      { 
        id: 'item-1', 
        topic: '', 
        headers: [], 
        keyType: 'string', 
        keyValue: '', 
        valueType: 'json', 
        value: '',
        partitionerType: 'defined'
      }
    ])
  );

  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Persist state changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SELECTED_ITEM, selectedItem);
  }, [selectedItem]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DARK_MODE, isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MENU_ITEMS, menuItems);
  }, [menuItems]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FORM_DATA, formDataList);
  }, [formDataList]);

  // Apply dark mode to document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Validate selectedItem exists in menuItems
  useEffect(() => {
    const itemExists = menuItems.some(item => item.id === selectedItem);
    if (!itemExists && menuItems.length > 0) {
      // Find first non-add-new item or fallback to first item
      const firstDataItem = menuItems.find(item => item.type === 'data');
      setSelectedItem(firstDataItem?.id || menuItems[0].id);
    }
  }, [menuItems, selectedItem]);

  const handleItemSelect = (itemId: string) => {
    if (itemId === 'add-new') {
      // Create a new item
      const newItemId = `item-${Date.now()}`;
      const newItem: MenuItem = {
        id: newItemId,
        name: `Event ${menuItems.length}`,
        type: 'data'
      };
      
      // Add new item before the "Add New" item
      const updatedItems = [...menuItems];
      updatedItems.splice(-1, 0, newItem);
      setMenuItems(updatedItems);
      
      // Add new form data
      const newFormData: FormData = {
        id: newItemId,
        topic: '',
        headers: [],
        keyType: 'string',
        keyValue: '',
        valueType: 'json',
        value: '',
        partitionerType: 'defined'
      };
      setFormDataList([...formDataList, newFormData]);
      
      // Select the new item
      setSelectedItem(newItemId);
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleFormDataUpdate = (itemId: string, field: keyof FormData, value: string | Header[]) => {
    setFormDataList(prevList =>
      prevList.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleHeaderAdd = (itemId: string) => {
    const newHeader: Header = {
      id: `header-${Date.now()}`,
      key: '',
      value: ''
    };
    
    setFormDataList(prevList =>
      prevList.map(item =>
        item.id === itemId 
          ? { ...item, headers: [...item.headers, newHeader] }
          : item
      )
    );
  };

  const handleHeaderUpdate = (itemId: string, headerId: string, field: 'key' | 'value', value: string) => {
    setFormDataList(prevList =>
      prevList.map(item =>
        item.id === itemId
          ? {
              ...item,
              headers: item.headers.map(header =>
                header.id === headerId ? { ...header, [field]: value } : header
              )
            }
          : item
      )
    );
  };

  const handleHeaderDelete = (itemId: string, headerId: string) => {
    setFormDataList(prevList =>
      prevList.map(item =>
        item.id === itemId
          ? { ...item, headers: item.headers.filter(header => header.id !== headerId) }
          : item
      )
    );
  };

  const getCurrentFormData = (itemId: string): FormData | undefined => {
    return formDataList.find(item => item.id === itemId);
  };

  const getCurrentEventName = (itemId: string): string => {
    const menuItem = menuItems.find(item => item.id === itemId);
    return menuItem?.name || '';
  };

  const handleEventNameUpdate = (itemId: string, newName: string) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, name: newName } : item
      )
    );
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // TODO: Implement settings modal
  };

  const handleAbout = () => {
    setIsAboutModalOpen(true);
  };

  return (
    <div className={`app-layout ${isDarkMode ? 'dark' : 'light'}`}>
      <Sidebar
        menuItems={menuItems}
        selectedItem={selectedItem}
        onItemSelect={handleItemSelect}
        onSettingsClick={handleSettings}
        onThemeToggle={toggleTheme}
        onAboutClick={handleAbout}
        isDarkMode={isDarkMode}
      />
      <MainContent 
        selectedItem={selectedItem} 
        formData={getCurrentFormData(selectedItem)}
        eventName={getCurrentEventName(selectedItem)}
        onFormDataUpdate={handleFormDataUpdate}
        onEventNameUpdate={handleEventNameUpdate}
        onHeaderAdd={handleHeaderAdd}
        onHeaderUpdate={handleHeaderUpdate}
        onHeaderDelete={handleHeaderDelete}
      />
      
      {/* About Modal */}
      {isAboutModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAboutModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>About Kafka Event Publisher</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setIsAboutModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="app-info">
                <div className="app-logo">
                  <SiApachekafka size={48} />
                </div>
                <h3>Kafka Event Publisher UI</h3>
                <p className="version">Version 1.0.0</p>
                <p className="description">
                  A modern, user-friendly interface for creating and publishing Apache Kafka events. 
                  Built with React and TypeScript for a seamless developer experience.
                </p>
                
                <div className="features-list">
                  <h4>Features:</h4>
                  <ul>
                    <li>✓ Interactive event configuration</li>
                    <li>✓ Dynamic headers management</li>
                    <li>✓ JSON payload formatting</li>
                    <li>✓ Multiple event management</li>
                    <li>✓ Persistent data storage</li>
                    <li>✓ Dark/Light theme support</li>
                  </ul>
                </div>
                
                <div className="tech-stack">
                  <h4>Built with:</h4>
                  <p>React 19.1.1, TypeScript, Vite, React Icons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
