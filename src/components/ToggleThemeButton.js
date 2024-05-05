import { Button } from "antd";
import { HiOutlineSun, HiOutlineMoon} from "react-icons/hi"
const ToggleThemeButton = ({darkTheme, toggleTheme}) => {
    return (
        <div style={{margin:'10px'}}>
            <Button onClick={toggleTheme} icon={darkTheme ? <HiOutlineSun /> : <HiOutlineMoon />}></Button>
        </div>
    )
}
export default ToggleThemeButton;