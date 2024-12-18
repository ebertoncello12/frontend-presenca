import React from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import SocialNetworks from "./SocialNetworks";
import { Typography } from "antd";
import get from "lodash/get";
import { jwtDecode } from "jwt-decode";
import {
  actionSignIn,
  actionSignInSuccess,
  actionSignInError,
} from "./actions";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginService from "../../services/Login/LoginService";
import ApiConfig from "../../services/ApiConfig";
const { Title } = Typography;

export default function SignIn() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { auth } = useSelector((state) => state);

  const onFinish = async (values) => {
    try {
      dispatch(actionSignIn());
      const payload = {
        email: get(values, "email", ""),
        password: get(values, "password", ""),
      };

     

      const res = await LoginService.login(payload);
        const acessToken = res.token
       // Decodificar o token JWT para obter os dados
       const decoded = jwtDecode(acessToken);

       // Exemplo de acesso aos dados decodificados

      if (res) {
        dispatch(actionSignInSuccess(acessToken, decoded));
        form.resetFields();
        message.success("Login realizado com sucesso!");
        navigate("/home");
      }
    } catch (error) {
      const errorMessage = get(error, "error.message", "E-mail ou senha errados");
      message.error(errorMessage);
      dispatch(actionSignInError(error));
    }
  };

  const onFinishFailed = (errorInfo) => {
  };

  return (
    <>
      <Form
        name="signin"
        form={form}
        initialValues={{
          remember: false,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Title level={2} className="text-center">
          Logar
        </Title>
        <SocialNetworks />

        <div className="option-text">ou use sua conta outlook </div>

        <Form.Item
          name="email"
          hasFeedback
          label="Email"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Porfavor coloque seu email.",
            },
            {
              type: "email",
              message: "Email invalido.",
            },
          ]}
        >
          <Input placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          hasFeedback
          label="Senha"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Porfavor coloque sua senha.",
            },
          ]}
        >
          <Input.Password placeholder="Senha" size="large" />
        </Form.Item>

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Lembrar de mim</Checkbox>
          </Form.Item>

          <a className="login-form-forgot" href="#">
            Esqueceu a senha?
          </a>
        </Form.Item>

        <Button
          loading={auth.loading}
          type="primary"
          htmlType="submit"
          shape="round"
          icon={<LoginOutlined />}
          size="large"
          style={{ background: '#011526', borderColor: '#011526' }}

        >
          Logar
        </Button>
      </Form>
    </>
  );
}
