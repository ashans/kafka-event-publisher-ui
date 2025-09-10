import { MenuItem } from './Layout';
import './Sidebar.css';
import { 
  IoSettingsOutline, 
  IoInformationCircleOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoAdd,
  IoDocumentTextOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { SiApachekafka } from 'react-icons/si';

interface SidebarProps {
  menuItems: MenuItem[];
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
  onItemDelete: (itemId: string) => void;
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  onAboutClick: () => void;
  isDarkMode: boolean;
}

const Sidebar = ({
  menuItems,
  selectedItem,
  onItemSelect,
  onItemDelete,
  onSettingsClick,
  onThemeToggle,
  onAboutClick,
  isDarkMode,
}: SidebarProps) => {
  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-placeholder">
          <SiApachekafka className="logo-icon" />
          <span className="logo-text">Kafka UI</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className={`nav-item ${item.type === 'add-new' ? 'nav-item-add-new' : ''}`}>
              {item.type === 'add-new' ? (
                <button
                  className="nav-button add-new-button"
                  onClick={() => onItemSelect(item.id)}
                  title="Add New Event"
                >
                  <span className="nav-icon"><IoAdd /></span>
                </button>
              ) : (
                <div className="nav-item-content">
                  <button
                    className={`nav-button ${selectedItem === item.id ? 'active' : ''}`}
                    onClick={() => onItemSelect(item.id)}
                  >
                    <span className="nav-icon"><IoDocumentTextOutline /></span>
                    <span className="nav-text">{item.name}</span>
                  </button>
                  <button
                    className="nav-delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemDelete(item.id);
                    }}
                    title="Delete Event"
                  >
                    <IoCloseOutline />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        <button className="bottom-button icon-only" onClick={onSettingsClick} title="Settings">
          <span className="button-icon"><IoSettingsOutline /></span>
        </button>
        <button className="bottom-button icon-only theme-toggle" onClick={onThemeToggle} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <span className="button-icon">{isDarkMode ? <IoSunnyOutline /> : <IoMoonOutline />}</span>
        </button>
        <button className="bottom-button icon-only" onClick={onAboutClick} title="About">
          <span className="button-icon"><IoInformationCircleOutline /></span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
