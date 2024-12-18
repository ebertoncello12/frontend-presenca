// src/Login.js
import React from 'react';
import { Form, Input, Button, Checkbox, Typography, message } from 'antd';
import './Login.css'; // Importação do arquivo de estilos

const { Title } = Typography;

const Login = () => {
  const onFinish = (values) => {
    // Aqui você pode implementar a lógica de autenticação
    // Simulando uma lógica de autenticação simples
    if (values.username === 'usuario' && values.password === 'senha') {
      message.success('Login successful');
      // Aqui você redirecionaria o usuário para a próxima página
    } else {
      message.error('Invalid username or password');
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error('Please fill in all required fields');
  };

  return (
    <div className="login-container">
      <Title level={2}>Login de Estudante</Title>
      <Form
        className="login-form"
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Lembrar de mim</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
