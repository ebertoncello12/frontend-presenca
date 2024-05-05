import { HomeOutlined, AppstoreAddOutlined, PayCircleOutlined, AreaChartOutlined, SettingOutlined, BarsOutlined } from "@ant-design/icons";
import { Menu } from "antd";
const MenuList = ({darkTheme}) => {
    const pageRedirect = (key) => {
        console.log('Page Key - ',key);
    }
    const items = [
        { label:'Home', key:'home', icon:<HomeOutlined/>},
        { label:'Activity', key:'activity', icon:<AppstoreAddOutlined/>},
        { 
            label:'Task', key:'task', icon:<BarsOutlined/>,
            children:[
                { label:'Task 1', key:'task-1'},
                { 
                    label:'Task 2', key:'task-2',
                    children:[
                        { label:'Sub Task 1', key:'sub-task-1'},
                        { label:'Sub Task 2', key:'sub-task-2'},
                    ]
                },
            ]
        },
        { label:'Payment', key:'payment', icon:<PayCircleOutlined/>},
        { label:'Progress', key:'progress', icon:<AreaChartOutlined/>},
        { label:'Settings', key:'settings', icon:<SettingOutlined/>}
    ]
    return (
        <Menu 
            theme={darkTheme ? 'dark' : 'light'}
            mode="inline"
            items={items}
            className="menu-bar"
            onClick={(e) => pageRedirect(e.key)}
        />
    )
}

export default MenuList;