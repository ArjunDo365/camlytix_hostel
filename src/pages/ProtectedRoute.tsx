import React from "react";
import { CommonHelper } from "../helper/helper";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: any) => {
  const user = CommonHelper.GetLocalStorage(CommonHelper.UserStorageName, true);
  // const navigate = useNavigate();
  // console.log('checking protected route: ',user);
  if (!user.api_token) {
    // console.log('checking protected route: ',user.api_token);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
