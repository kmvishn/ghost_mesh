interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
    return (
        <header className="header">
            <nav className="navbar">
                <h1 className="navbar-brand">Ghost Mesh</h1>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#">Home</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">About</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Contact</a>
                    </li>
                    <li className="nav-item">
                        <button className="nav-link" onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
