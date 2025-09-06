import { MenuItem } from './Layout';
import './Sidebar.css';
import { 
  IoSettingsOutline, 
  IoInformationCircleOutline,
  IoSunnyOutline,
  IoMoonOutline,
  IoAdd,
  IoDocumentTextOutline
} from 'react-icons/io5';
import { SiApachekafka } from 'react-icons/si';

interface SidebarProps {
  menuItems: MenuItem[];
  selectedItem: string;
  onItemSelect: (itemId: string) => void;
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  onAboutClick: () => void;
  isDarkMode: boolean;
}

const Sidebar = ({
  menuItems,
  selectedItem,
  onItemSelect,
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
              <button
                className={`nav-button ${selectedItem === item.id ? 'active' : ''} ${item.type === 'add-new' ? 'add-new-button' : ''}`}
                onClick={() => onItemSelect(item.id)}
                title={item.type === 'add-new' ? 'Add New Event' : undefined}
              >
                {item.type === 'add-new' ? (
                  <span className="nav-icon"><IoAdd /></span>
                ) : (
                  <>
                    <span className="nav-icon"><IoDocumentTextOutline /></span>
                    <span className="nav-text">{item.name}</span>
                  </>
                )}
              </button>
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
