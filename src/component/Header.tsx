import '../css/Header.css';
import logo from '../asesst/logo.png';
import userIcon from '../asesst/user.png';

const Header = () => {
    return (
        <div className='header-container'>
            <img src={logo} alt="logo" className='logo'/>
            <img src={userIcon} alt="user" className='user-icon'/>
        </div>
    )
}

export default Header;