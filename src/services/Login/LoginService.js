import ApiConfig from "../ApiConfig";
const LoginService = {
    login: async (authPayload) => {
      try {
        const response = await ApiConfig.post('/login/auth', authPayload);
        localStorage.setItem('AUTH', response.data.token);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    // Adicione mais métodos de serviço conforme necessário
  };
  
  export default LoginService;