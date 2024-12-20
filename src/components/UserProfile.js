import React, { useState, useEffect } from 'react';
import { UserOutlined, KeyOutlined, LogoutOutlined, CalendarOutlined } from '@ant-design/icons';
import { Avatar, Popover, Button, List } from 'antd';
import { useSelector } from 'react-redux';
import { actionSignOut } from '../pages/Auth/actions';
import { useDispatch } from 'react-redux';

const UserProfile = () => {
    const profile = useSelector((state) => state.auth.profile.decodedPayload);


    const dispatch = useDispatch();

    const [currentDate, setCurrentDate] = useState('');

    const handleSignOut = () => {
        localStorage.removeItem('AUTH');
        dispatch(actionSignOut());
    };

    useEffect(() => {
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        setCurrentDate(formattedDate);
    }, []);

    const content = (
        <List>
            <List.Item>
                <Button block icon={<UserOutlined />} onClick={() => console.log('Minha conta')}>
                    Minha conta
                </Button>
            </List.Item>
            <List.Item>
                <Button block icon={<KeyOutlined />} onClick={() => console.log('Atualizar senha')}>
                    Atualizar senha
                </Button>
            </List.Item>
            <List.Item>
                <Button block type="primary" icon={<LogoutOutlined />} onClick={handleSignOut}>
                    Sair
                </Button>
            </List.Item>
        </List>
    );

    // Link para uma imagem aleatória de pessoa
    const avatarImage = 'https://randomuser.me/api/portraits/men/32.jpg'; // Exemplo de API randomuser.me para imagem aleatória de homem

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '10px', fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
                <CalendarOutlined style={{ marginRight: '5px' }} />
                {currentDate}
            </div>
            <div style={{ width: '150px', fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
                Matrícula: {profile?.payload?.registration}
            </div>
            <div style={{ width: '150px', fontFamily: 'Arial, sans-serif', fontSize: '16px' }}>
                Olá, {profile?.payload?.studentName}
            </div>
            <div>
                <Popover placement="bottomRight" content={content}>
                    <Avatar size={38} src={profile?.payload.registrationFace} />
                </Popover>
            </div>
        </div>
    );
};

export default UserProfile;
