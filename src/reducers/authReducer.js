import { SIGN_IN, SIGN_IN_SUCCESS, SIGN_IN_ERROR, SIGN_OUT } from "./constants";

const initialState = {
  loading: false,
  error: null,
  profile: {
    accessToken: null,
    decodedPayload: {},
  },
};

const system = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SIGN_IN_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: {
          accessToken: action.accessToken,
          decodedPayload: action.decodedPayload,
        },
        error: null,
      };
    case SIGN_IN_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case SIGN_OUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default system;
