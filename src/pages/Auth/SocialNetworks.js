import React from "react";
import {
  FacebookOutlined,
  LinkedinOutlined,
  Login,
  MailOutlined // Ícone do Outlook
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ApiConfig from "../../services/ApiConfig";
import { actionSignInSuccess } from "./actions";

const SocialNetworks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const responseGoogle = async (res) => {
    try {
      const googleSignIn = await ApiConfig({
        url: "/users/auth/google",
        data: {
          access_token: res.accessToken,
        },
        method: "POST",
      });

      if (googleSignIn.status === 200 || googleSignIn.status === 201) {
        const accessToken = res.headers.authorization;
        const { user } = res.data;
        user.accessToken = accessToken;
        // update user profile redux and persist
        dispatch(actionSignInSuccess(user));
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const responseFacebook = res => {
  //     console.log(res)
  // }

  return (
    <div className="social-container">
      {/* Ícone do Facebook */}
      <Tooltip title="Outlook" placement="bottom">
        <div className="social facebook">
          <MailOutlined />
        </div>
      </Tooltip>

    </div>
  );
};

export default React.memo(SocialNetworks);
