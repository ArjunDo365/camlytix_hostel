import nandi from "../../public/assets/images/loginImage.jpg";
import logo from "../../public/assets/images/logo.png";
import IconMail from "../components/Icon/IconMail";
import IconLockDots from "../components/Icon/IconLockDots";
import { CommonHelper } from "../helper/helper";
import { CommonService } from "../service/commonservice.page";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../store";
import { setPageTitle, toggleRTL } from "../store/themeConfigSlice";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import IconCaretDown from "../components/Icon/IconCaretDown";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const NewLogin = () => {
  const { t } = useTranslation();
  const currentLanguage = i18next.language;
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle("Login Cover"));
  });
  const navigate = useNavigate();
  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl"
      ? true
      : false;
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const setLocale = (flag: string) => {
    setFlag(flag);
    if (flag.toLowerCase() === "ae") {
      dispatch(toggleRTL("rtl"));
    } else {
      dispatch(toggleRTL("ltr"));
    }
  };
  const [flag, setFlag] = useState(themeConfig.locale);
  const [UserData, setUserData] = useState<any>({});

  const submitForm = async (e: any) => {
    //debugger
    CommonHelper.Showspinner();
    e.preventDefault();
    // clearAllLocalStorage();
    if (UserData.email == null) {
      return CommonHelper.ErrorToaster("Please enter email");
    }
    if (UserData.password == null) {
      return CommonHelper.ErrorToaster("Please enter password");
    }
    let res = await CommonService.CommonPost(UserData, "/UserLogin");
    if (res.Type == "S") {
      CommonHelper.SuccessToaster(res.Message);
      let LocalData: any = {};
      LocalData = jwtDecode(res?.result?.api_token ?? "");
      const data = { ...LocalData, ...res?.result, Ip: res?.Ip };
      CommonHelper.SetLocalStorage(CommonHelper.UserStorageName, data, true);
      navigate("/block");
      CommonHelper.Hidespinner();
    } else {
      CommonHelper.ErrorToaster(res.Message);
      CommonHelper.Hidespinner();
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Left Side Image - show only on laptop (lg) and above */}
      <div className="relative hidden lg:block lg:w-1/2 h-full">
        <img
          src={nandi}
          alt="An image of nandi in login screen"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-black to-transparent" />
      </div>

      {/* Right Side Form - full width on mobile & tablet, half on laptop */}
      <div className="w-full lg:w-1/2 h-full bg-black text-white flex p-6 lg:p-8 flex-col items-center justify-center">
        <img
          src={logo}
          alt="logo of saivas portal"
          className="w-[160px] h-[60px] mb-6 lg:w-[200px] lg:h-[75px]"
        />
        {/* <div className="dropdown">
          <Dropdown
            offset={[0, 8]}
            placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
            btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
            button={
              <>
                <div>
                  <img
                    src={`/assets/images/flags/${flag.toUpperCase()}.svg`}
                    alt="image"
                    className="h-5 w-5 rounded-full object-cover"
                  />
                </div>
                <div className="text-base font-bold uppercase">
                  {flag == "in" ? "TAM" : flag}
                </div>
                <span className="shrink-0">
                  <IconCaretDown />
                </span>
              </>
            }
          >
            <ul className="!px-2 text-dark dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
              {themeConfig.languageList.map((item: any) => {
                return (
                  <li key={item.code}>
                    <button
                      type="button"
                      className={`flex w-full hover:text-primary rounded-lg ${
                        flag === item.code ? "bg-primary/10 text-primary" : ""
                      }`}
                      onClick={() => {
                        i18next.changeLanguage(item.code);
                        // setFlag(item.code);
                        setLocale(item.code);
                      }}
                    >
                      <img
                        src={`/assets/images/flags/${item.code.toUpperCase()}.svg`}
                        alt="flag"
                        className="w-5 h-5 object-cover rounded-full"
                      />
                      <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Dropdown>
        </div> */}
        <div className="flex p-4 lg:p-8 flex-col items-center w-full lg:w-[80%]">
          <h1 className="text-[20px] lg:text-3xl font-bold uppercase !leading-snug text-white mb-4 text-center">
            {t("Sign In To Camlytix")}
          </h1>

          {/* <button
            type="button"
            className="btn btn-success w-full mb-8 bg-white text-black"
          >
            {t("Login using OTP")}
          </button> */}

          {/* <p className="text-[18px] lg:text-[21px] font-bold text-gray-400">
            {t("or")}
          </p> */}

          <form
            className="space-y-5 dark:text-white w-full mt-4"
            onSubmit={submitForm}
          >
            <div>
              <label htmlFor="Email" className="text-gray-400 font-bold">
                {t("Email")}
              </label>
              <div className="relative text-white-dark">
                <input
                  id="Email"
                  type="email"
                  placeholder={t("Enter Email")}
                  className="form-input ps-10 placeholder:text-white-dark"
                  value={UserData.email || ""}
                  onChange={(event) =>
                    setUserData({ ...UserData, email: event.target.value })
                  }
                />
                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                  <IconMail fill={true} />
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="Password" className="text-gray-400 font-bold">
                {t("Password")}
              </label>
              <div className="relative text-white-dark">
                <input
                  id="Password"
                  type="password"
                  placeholder={t("Enter Password")}
                  className="form-input ps-10 placeholder:text-white-dark"
                  value={UserData.password || ""}
                  onChange={(event) =>
                    setUserData({ ...UserData, password: event.target.value })
                  }
                />
                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                  <IconLockDots fill={true} />
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-info !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
            >
              {t("Sign in")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewLogin;
