import React from "react";
import { HomeOutlined, AppstoreAddOutlined, PayCircleOutlined, AreaChartOutlined, SettingOutlined, BarsOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const MenuList = ({ darkTheme }) => {
    const items = [
        { label:'Home', key:'home', icon:<HomeOutlined />, url:'/home'},
        { label:'Materias', key:'subjects', icon:<AppstoreAddOutlined />, url:'/materias'},
        { label:'Faltas', key:'faults', icon:<AppstoreAddOutlined />, url:'/faltas'},
        { label:'QR Code', key:'qrcode', icon:<PayCircleOutlined />, url:'/qrcode'}, // Aqui foi trocado para PayCircleOutlined
        { 
            label:'Aulas', key:'class', icon:<BarsOutlined />,
            children:[
                { label:'Presença', key:'attendance', icon:<AreaChartOutlined />, url:'/presenca'},
                { label:'Qr Code', key:'qrcode-aulas', icon:<PayCircleOutlined />, url:'/qrcode-aulas'},
            ]
        },
        { label:'Configurações', key:'settings', icon:<SettingOutlined />, url:'/configuracao'}
    ];

    const renderMenuItems = (items) => {
        return items.map(item => {
            if (item.children) {
                return (
                    <Menu.SubMenu key={item.key} title={item.label} icon={item.icon}>
                        {renderMenuItems(item.children)}
                    </Menu.SubMenu>
                );
            } else {
                return (
                    <Menu.Item key={item.key} icon={item.icon}>
                        <Link to={item.url}>{item.label}</Link>
                    </Menu.Item>
                );
            }
        });
    };

    return (
        <Menu 
            theme={darkTheme ? 'dark' : 'light'}
            mode="inline"
            className="menu-bar"
        >
            {renderMenuItems(items)}
        </Menu>
    );
};

export default MenuList;
