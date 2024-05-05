import { Button, Layout, theme } from "antd";
import Logo from "./components/Logo";
import MenuList from "./components/MenuList";
import ToggleThemeButton from "./components/ToggleThemeButton";
import { useState } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined} from "@ant-design/icons";
import UserProfile from "./components/UserProfile";
import PageContent from "./components/PageContent";
const { Header, Sider, Content, Footer } = Layout;

const App = () => {
  const [darkTheme, setDarkTheme] = useState(true);
  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  }
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout style={{minHeight:'100%'}}>
      <Sider collapsed={collapsed} className="sidebar" theme={darkTheme ? 'dark' : 'light'}>
        <Logo />
        <MenuList darkTheme={darkTheme}/>
        <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme}/>
      </Sider>
      <Layout>
        <Header style={{display:'flex', justifyContent:'space-between', background: colorBgContainer, paddingLeft:'10px', paddingRight:'10px'}}>
          <div>
            <Button icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)}></Button>
          </div>
          <div>
            <UserProfile />
          </div>
        </Header>
        <Content>
          <div style={{padding:'10px'}}>
              <small>Home / Dashboard</small>
          </div>
          <div style={{paddingLeft:'10px', width:'99%'}}>
              <PageContent />
          </div>
        </Content>
        <Footer style={{textAlign:'center'}}>
          Copyright {new Date().getFullYear()}, designed by Rubyvidhya
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
