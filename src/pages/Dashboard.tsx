import React, { Fragment, useEffect, useState } from "react";
import { Block } from "../types/types";
import {
  Cctv,
  DownloadIcon,
  Edit,
  Plus,
  Router,
  Save,
  Trash2,
  XCircle,
  XIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { CommonHelper } from "../helper/helper";
import { CommonService } from "../service/commonservice.page";
import { Tab } from "@headlessui/react";
import ReactApexChart from "react-apexcharts";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inactivelist, setInactivelist] = useState([]);
  // const [Dashboard, setDashboard] = useState([]);
  const [Dashboard, setDashboard] = useState<any>({});

  const [GirlStatus, setGirlStatus] = useState<any>({
    series: [],
    options: {},
  });
  const [BoyStatus, setBoyStatus] = useState<any>({ series: [], options: {} });
  const [last10Boys, setLast10Boys] = useState<any[]>([]);
  const [Last10Girls, setLast10Girls] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [GirlSearchText, setGirlSearchText] = useState("");

  const filteredBoys = last10Boys.filter((Boy: any) => {
    const text = searchText.toLowerCase();

    return (
      Boy.asset_no?.toLowerCase().includes(text) ||
      Boy.model_name?.toLowerCase().includes(text) ||
      Boy.ip_address?.toLowerCase().includes(text) ||
      Boy.location_name?.toLowerCase().includes(text) ||
      Boy.floor_name?.toLowerCase().includes(text) ||
      Boy.block_name?.toLowerCase().includes(text)
    );
  });

  const filteredGirls = Last10Girls.filter((cam: any) => {
    const text = GirlSearchText.toLowerCase();

    return (
      cam.asset_no?.toLowerCase().includes(text) ||
      cam.model_name?.toLowerCase().includes(text) ||
      cam.ip_address?.toLowerCase().includes(text) ||
      cam.location_name?.toLowerCase().includes(text) ||
      cam.floor_name?.toLowerCase().includes(text) ||
      cam.block_name?.toLowerCase().includes(text)
    );
  });

  useEffect(() => {
    loadData();
    dashboardGirlandBoy();
  }, []);

  const InactiveList = async (data: any) => {
    try {
      setLoading(true);

      // const result = await window.electronAPI.downloadNotWorkingCSV(data);
      const result = await CommonService.GetAll("");

      if (result.success) {
        // CommonHelper.SuccessToaster(result.message, result.data.filePath);
      } else {
        CommonHelper.ErrorToaster(result.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Manualping = async () => {
    setLoading(true);
    // const Ping = await window.electronAPI.manualPingTrigger();
    // if (Ping.success) {
    //   CommonHelper.SuccessToaster(Ping.message);
    //   loadData();
    //   dashboardGirlandBoy();
    // }
    setLoading(false);
  };

  const dashboardGirlandBoy = async () => {
    try {
      setLoading(true);

      // const FullDashboadData = await window.electronAPI.getGirlsAndBoys();
      const FullDashboadData = await CommonService.GetAll("/BlockList");

      if (FullDashboadData.success) {
        // ⬅️ Store last10Boys data in state
        setLast10Girls(FullDashboadData.data.Girls);

        // ⬅️ Store last10Girls data in state
        setLast10Boys(FullDashboadData.data.Boys);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // const DashboardData = await window.electronAPI.BoyGirlsummary();
      const DashboardData = await CommonService.GetAll("/BlockList");
      // console.log("data from backend for Dashboard: ", DashboardData);

      if (DashboardData.success) {
        setDashboard(DashboardData.data);

        const d = DashboardData.data;

        // Boy DONUT CHART (Same style as Boy chart)
        setBoyStatus({
          series: [Number(d.active_Boys), Number(d.inactive_Boys)],

          options: {
            chart: {
              type: "pie",
              height: 380,
              foreColor: "#000",
            },

            title: {
              text: `Total : ${d.total_Boys}`,
              align: "center",
              style: {
                fontSize: "20px",
                fontWeight: 600,
                color: "#000",
              },
            },

            labels: ["Working ", "Not Working "],

            colors: ["#5d965d", "#ec6871"],

            legend: {
              position: "bottom",
            },

            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`,
            },
          },
        });

        // Girl DONUT CHART (Same style as Girl chart)
        setGirlStatus({
          series: [Number(d.active_Girls), Number(d.inactive_Girls)],

          options: {
            chart: {
              type: "pie",
              height: 380,
              foreColor: "#000",
            },

            title: {
              text: `Total : ${d.total_Girls}`,
              align: "center",
              style: {
                fontSize: "20px",
                fontWeight: 600,
                color: "#000",
              },
            },

            labels: ["Working ", "Not Working "],
            colors: ["#5d965d", "#ec6871"],

            legend: {
              position: "bottom",
            },

            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`,
            },
          },
        });
      }

      // if (DashboardData.success) {
      //   setDashboard(DashboardData.data);
      // }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div>
          {/* <h2 className="text-2xl font-semibold text-gray-800 dark:text-black mb-6">
            Dashboard
          </h2> */}
        </div>
        <div>
          <button
            className="flex gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-800 transition"
            onClick={() => Manualping()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#fff"
            >
              <path d="M480-480Zm0 360q-18 0-34.5-6.5T416-146L148-415q-35-35-51.5-80T80-589q0-103 67-177t167-74q48 0 90.5 19t75.5 53q32-34 74.5-53t90.5-19q100 0 167.5 74T880-590q0 49-17 94t-51 80L543-146q-13 13-29 19.5t-34 6.5Zm40-520q10 0 19 5t14 13l68 102h166q7-17 10.5-34.5T801-590q-2-69-46-118.5T645-758q-31 0-59.5 12T536-711l-27 29q-5 6-13 9.5t-16 3.5q-8 0-16-3.5t-14-9.5l-27-29q-21-23-49-36t-60-13q-66 0-110 50.5T160-590q0 18 3 35.5t10 34.5h187q10 0 19 5t14 13l35 52 54-162q4-12 14.5-20t23.5-8Zm12 130-54 162q-4 12-15 20t-24 8q-10 0-19-5t-14-13l-68-102H236l237 237q2 2 3.5 2.5t3.5.5q2 0 3.5-.5t3.5-2.5l236-237H600q-10 0-19-5t-15-13l-34-52Z" />
            </svg>
            {/* <HeartIcon/> */}
            {/* <HeartCrackIcon/> */}
            Run Health Check
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6 mb-6">
        {/* Boy Status */}
        <div className="panel h-full transition-all duration-300 bg-[#fff] shadow-[0_3px_10px_rgb(0,0,0,0.2)] dark:bg-[#e3e3e3]  rounded-2xl pb-3 mb-6">
          <div className=" rounded-2xl ">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <h5 className="font-semibold text-lg text-gray-800 dark:text-dark flex gap-2">
                {/* <Router/> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#111"
                >
                  <path d="M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z" />
                </svg>
                Boy
              </h5>
            </div>

            {/* Chart */}
            <div className="p-4">
              {loading ? (
                <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-20 rounded-xl">
                  <span className="animate-spin border-2 border-gray-600 dark:border-white !border-l-transparent rounded-full w-6 h-6 inline-flex"></span>
                </div>
              ) : (
                <>
                  {/* Button Row */}
                  <div className="flex justify-end mb-3">
                    <div className="flex justify-end mb-3">
                      {Number(Dashboard?.inactive_Boys) > 0 && (
                        <button
                          className="flex gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition"
                          onClick={() => InactiveList("Boys")}
                        >
                          <DownloadIcon />
                          Download Not Working Boy
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chart */}
                  {Number(Dashboard.total_Boys) === 0 ? (
                    <div className="min-h-[325px] grid place-content-center text-gray-500 text-lg">
                      No Boy Data Available
                    </div>
                  ) : (
                    <ReactApexChart
                      series={BoyStatus.series}
                      options={BoyStatus.options}
                      type="pie"
                      height={380}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Girl Status */}
        <div className=" panel h-full transition-all duration-300 bg-[#fff] shadow-[0_3px_10px_rgb(0,0,0,0.2)] dark:bg-[#e3e3e3]  rounded-2xl pb-3 mb-6">
          <div className=" rounded-2xl ">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <h5 className="font-semibold text-lg text-gray-800 dark:text-dark flex gap-2">
                {/* <Cctv/> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#111"
                >
                  <path d="M400-80v-240H280l122-308q10-24 31-38t47-14q26 0 47 14t31 38l122 308H560v240H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z" />
                </svg>
                Girl
              </h5>
            </div>

            {/* Chart */}
            <div className="p-4">
              {loading ? (
                <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-20 rounded-xl">
                  <span className="animate-spin border-2 border-gray-600 dark:border-white !border-l-transparent rounded-full w-6 h-6 inline-flex"></span>
                </div>
              ) : (
                <>
                  {/* Button Row */}
                  {/* <div className="flex justify-end mb-3">
                    <button
                      className="flex gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-700 transition"
                      onClick={() => InactiveList("Girls")}
                    >
                      <DownloadIcon/>
                      Not Working Download
                    </button>
                  </div> */}
                  <div className="flex justify-end mb-3">
                    {Number(Dashboard?.inactive_Girls) > 0 && (
                      <button
                        className="flex gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition"
                        onClick={() => InactiveList("Girls")}
                      >
                        <DownloadIcon />
                        Download Not Working Girl
                      </button>
                    )}
                  </div>

                  {/* Girl STATUS PIE CHART */}
                  {Number(Dashboard.total_Girls) === 0 ? (
                    <div className="min-h-[325px] grid place-content-center text-gray-500 text-lg">
                      No Girl Data Available
                    </div>
                  ) : (
                    <ReactApexChart
                      series={GirlStatus.series}
                      options={GirlStatus.options}
                      type="pie"
                      height={380}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 w-full">
        <Tab.Group>
          <Tab.List className="mt-3 flex flex-wrap border-b border-gray-300 dark:border-gray-700">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
        ${
          selected
            ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
            : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-700"
        }`}
                >
                  Boy
                </button>
              )}
            </Tab>

            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
        ${
          selected
            ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
            : "bg-transparent text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-700"
        }`}
                >
                  Girl
                </button>
              )}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="active pt-5">
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-black">
                    Boy List
                  </h2>

                  <input
                    type="text"
                    placeholder="Search..."
                    className="px-3 py-2 border rounded-lg focus:ring focus:ring-purple-300 text-black"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Reg No 
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Is Working
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th> */}
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBoys.map((data: any) => (
                          <tr key={data.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {n?.asset_no?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                                </div> */}
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {data.asset_no}
                                  </div>
                                  {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.model_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.block_name} &gt; {data.floor_name} &gt;{" "}
                                {data.location_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.ip_address}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.last_working_on
                                  ? new Date(data.last_working_on)
                                      .toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                      .replace(/ /g, "-")
                                      .replace(",-", " ")
                                  : "-"}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {data.is_working == 0 ? (
                                  <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                                    Not Working
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                                    Working
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {data.status == 0 ? (
                                  <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                                    Inactive
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                                    Active
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {data.status}
                                </div>
                              </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="active pt-5">
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-black">
                    Girl List
                  </h2>

                  <input
                    type="text"
                    placeholder="Search..."
                    className="px-3 py-2 border rounded-lg focus:ring focus:ring-purple-300 text-black"
                    value={GirlSearchText}
                    onChange={(e) => setGirlSearchText(e.target.value)}
                  />
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Reg No 
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                          {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Is Working
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th> */}
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGirls.map((data: any) => (
                          <tr key={data.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {n?.asset_no?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                                </div> */}
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {data.asset_no}
                                  </div>
                                  {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.model_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.block_name} &gt; {data.floor_name} &gt;{" "}
                                {data.location_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.ip_address}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.last_working_on
                                  ? new Date(data.last_working_on)
                                      .toLocaleString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                      .replace(/ /g, "-")
                                      .replace(",-", " ")
                                  : "-"}
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {data.is_working == 0 ? (
                                  <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                                    Not Working
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                                    Working
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {data.status == 0 ? (
                                  <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                                    Inactive
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                                    Active
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {data.status}
                                </div>
                              </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Inactive List
              </h3>
              <button
                className="text-gray-600 hover:text-black"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {inactivelist.map((data: any) => (
                      <tr key={data.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {/* Text */}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {data.name}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
