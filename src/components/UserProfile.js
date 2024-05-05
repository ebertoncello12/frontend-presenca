import { useState, useEffect } from "react";
import { UserOutlined, KeyOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Popover, Button, List  } from 'antd';

const UserProfile = () => {
    const [currentTime,setCurrentTime] = useState(new Date());
    useEffect(()=>{
        const interval = setTimeout(()=>{
            setCurrentTime(new Date())
        },1000)
        return () => {
            clearTimeout(interval)
        }
    })
    const content = (
        <List>
          <List.Item><UserOutlined /> My Account</List.Item>
          <List.Item><KeyOutlined /> Update Password</List.Item>
          <List.Item>
            <Button type="primary"><LogoutOutlined /> Logout</Button>
          </List.Item>
        </List>
      );
    return (
        <div style={{display:"flex"}}>
            <div style={{width:'150px',color:'red'}}>
                {`${currentTime.toLocaleDateString()} ${currentTime.toLocaleTimeString()} `}
            </div>
            <div>
                <Popover placement="bottomRight" content={content} >
                    <Avatar size={38} icon={<UserOutlined />} />
                </Popover>                
            </div>
        </div>
    )
}

export default UserProfile;