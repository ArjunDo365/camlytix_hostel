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
import noImage from "../../public/assets/images/noImg.png";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inactivelist, setInactivelist] = useState([]);
  // const [Dashboard, setDashboard] = useState([]);
  const [Dashboard, setDashboard] = useState<any>({});
  const [lastUpdate, setLastUpdate] = useState("");
  const [GirlStatus, setGirlStatus] = useState<any>({
    series: [],
    options: {},
  });
  const [BoyStatus, setBoyStatus] = useState<any>({ series: [], options: {} });
  const [maleInfo, setMaleInfo] = useState(null);
  const [femaleInfo, setFemaleInfo] = useState(null);

  const [last10Boys, setLast10Boys] = useState<any[]>([]);
  const [Last10Girls, setLast10Girls] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [GirlSearchText, setGirlSearchText] = useState("");

  const REFRESH_TIME = 3 * 60; // 3 minutes = 180 seconds
  const [countdown, setCountdown] = useState(REFRESH_TIME);

  const filteredBoys = last10Boys.filter((Boy: any) => {
    const text = searchText.toLowerCase();

    return (
      Boy.id?.toLowerCase().includes(text) ||
      Boy.register_number?.toLowerCase().includes(text) ||
      Boy.name?.toLowerCase().includes(text) ||
       Boy.branch?.toLowerCase().includes(text) ||
        Boy.degree?.toLowerCase().includes(text) ||
         Boy.room_no?.toLowerCase().includes(text) 
    );
  });

  const filteredGirls = Last10Girls.filter((cam: any) => {
    const text = GirlSearchText.toLowerCase();

    return (
      cam.id?.toLowerCase().includes(text) ||
      cam.register_number?.toLowerCase().includes(text) ||
      cam.name?.toLowerCase().includes(text) ||
       cam.branch?.toLowerCase().includes(text) ||
        cam.degree?.toLowerCase().includes(text) ||
         cam.room_no?.toLowerCase().includes(text) 
    );
  });

  useEffect(() => {
    loadData();
dashboardGirlandBoy("male");
  dashboardGirlandBoy("female");

    const now = new Date();

    // Format: DD-MMM-YYYY HH:mm
    const formatted =
      now
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-") +
      " " +
      now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    setLastUpdate(formatted);

    // Countdown every 1 second
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload(); // Auto refresh page
          return REFRESH_TIME; // reset countdown after refresh
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Convert seconds to MM:SS
  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const InactiveList = async (gender) => {
    try {
      const response = await CommonService.GetAll(
        `/DashBoardStudentList/${gender}`
      );

      // Filter students who have timeout value
      const timeoutList = response.filter((s) => s.time_out);

      if (timeoutList.length === 0) {
        alert("No timeout students found");
        return;
      }

      // Export CSV
      exportCSV(timeoutList, gender);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const exportCSV = (records, gender) => {
    let columns = Object.keys(records[0]);

    // Remove unwanted columns
    columns = columns.filter((col) => !"student_image".includes(col));

    const filename = `${gender}_Timeout_List`;

    const colDelimiter = ";";
    const lineDelimiter = "\n";

    let csv = columns.join(colDelimiter) + lineDelimiter;

    records.forEach((row) => {
      csv += columns.map((col) => row[col] ?? "").join(colDelimiter);
      csv += lineDelimiter;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const loadData = async () => {
    
    try {
      setLoading(true);

      const DashboardData = await CommonService.GetAll(
        "/DashBoardStudentChartList"
      );

      const dataArray = DashboardData;
      setDashboard(dataArray);

      const maleData = dataArray.find((x) => x.gender === "male");
      const femaleData = dataArray.find((x) => x.gender === "female");

      // BOY CHART
      setBoyStatus({
        series: [
          Number(maleData?.time_in ?? 0),
          Number(maleData?.time_out ?? 0),
        ],
        options: {
          chart: { type: "pie", height: 380, foreColor: "#000" },
          title: {
            text: `Total : ${
              Number(maleData?.time_in ?? 0) + Number(maleData?.time_out ?? 0)
            }`,
            align: "center",
          },
          labels: ["IN", "OUT"],
          colors: ["#5d965d", "#ec6871"],
          legend: { position: "bottom" },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(1)}%`,
          },
        },
      });

      // GIRL CHART
      setGirlStatus({
        series: [
          Number(femaleData?.time_in ?? 0),
          Number(femaleData?.time_out ?? 0),
        ],
        options: {
          chart: { type: "pie", height: 380, foreColor: "#000" },
          title: {
            text: `Total : ${
              Number(femaleData?.time_in ?? 0) +
              Number(femaleData?.time_out ?? 0)
            }`,
            align: "center",
          },
          labels: ["IN", "OUT"],
          colors: ["#5d965d", "#ec6871"],
          legend: { position: "bottom" },
          dataLabels: {
            enabled: true,
            formatter: (val) => `${val.toFixed(1)}%`,
          },
        },
      });

      setMaleInfo(maleData);
      setFemaleInfo(femaleData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardGirlandBoy = async (gender) => {
    try {
      setLoading(true);

      const FullDashboadData = await CommonService.GetAll(
        `/DashBoardStudentList/${gender}`
      );

      // if (FullDashboadData.success) {
      const list = FullDashboadData; // full array

      const filtered = list.filter((item) => item.gender === gender);

      if (gender === "male") {
        setLast10Boys(filtered);
      } else if (gender === "female") {
        setLast10Girls(filtered);
      }
      // }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";

    // Convert "2025-12-02 12:17:21" → "2025-12-02T12:17:21"
    const date = new Date(dateString.replace(" ", "T"));

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formatted = new Intl.DateTimeFormat("en-GB", options).format(date);

    // "02 Dec 2025, 12:17:21" → "02-Dec-2025 12:17:21"
    return formatted.replace(" ", "-").replace(" ", "-").replace(",", "");
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="text-xl font-semibold text-blue-700 p-3">
          Page will auto-refresh in: <span>{formatTime(countdown)}</span>
        </div>
        <div>
          <p className="text-xl">
            Last Update On : <span className="font-bold">{lastUpdate}</span>
          </p>
          {/* <button
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
            Run Health Check
          </button> */}
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
                Boys
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
                      {maleInfo?.time_out > 0 && (
                        <button
                          className="flex gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition"
                          onClick={() => InactiveList("male")}
                        >
                          <DownloadIcon />
                          Download Hostel Out Boys
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chart */}
                  {!maleInfo ||
                  (maleInfo.time_in == 0 && maleInfo.time_out == 0) ? (
                    <div className="min-h-[325px] grid place-content-center text-gray-500 text-lg">
                      No Boys Data Available
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
                Girls
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
                    {femaleInfo?.time_out > 0 && (
                      <button
                        className="flex gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition"
                        onClick={() => InactiveList("female")}
                      >
                        <DownloadIcon />
                        Download Hostel Out Girls
                      </button>
                    )}
                  </div>

                  {/* Girl STATUS PIE CHART */}
                  {!femaleInfo ||
                  (femaleInfo.time_in == 0 && femaleInfo.time_out == 0) ? (
                    <div className="min-h-[325px] grid place-content-center text-gray-500 text-lg">
                      No Girls Data Available
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
        type="button"
        className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
          ${
            selected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-transparent text-gray-600 hover:bg-blue-100"
          }`}
      >
        Boys
      </button>
    )}
  </Tab>

  <Tab as={Fragment}>
    {({ selected }) => (
      <button
        type="button"
        className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
          ${
            selected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-transparent text-gray-600 hover:bg-blue-100"
          }`}
      >
        Girls
      </button>
    )}
  </Tab>
</Tab.List>


          <Tab.Panels>
            <Tab.Panel unmount={false}>
              <div className="active pt-5">
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-black">
                    Boys List
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
                            Student Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Number
                          </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Degree
                          </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time In
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time OUT
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBoys?.map((stu) => (
                          <tr key={stu.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={
                                    stu.student_image
                                      ? stu.student_image
                                      : noImage
                                  }
                                  alt="Profile"
                                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300 shadow-lg"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {block.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div> */}
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {stu.name}
                                  </div>
                                  {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.register_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.degree}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.branch}
                              </div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.room_no}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {stu.time_in ? (
                                <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                                  {formatDateTime(stu.time_in)}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {stu.time_out ? (
                                <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                                  {formatDateTime(stu.time_out)}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel unmount={false}>
              <div className="active pt-5">
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-black">
                    Girls List
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
                            Student Image
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration Number
                          </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Degree
                          </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time In
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time OUT
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGirls?.map((stu) => (
                          <tr key={stu.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={
                                    stu.student_image
                                      ? stu.student_image
                                      : noImage
                                  }
                                  alt="Profile"
                                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-300 shadow-lg"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {block.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div> */}
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {stu.name}
                                  </div>
                                  {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.register_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.degree}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.branch}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {stu.room_no}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {stu.time_in ? (
                                <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                                  {formatDateTime(stu.time_in)}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {stu.time_out ? (
                                <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                                  {formatDateTime(stu.time_out)}
                                </span>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>

                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
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
