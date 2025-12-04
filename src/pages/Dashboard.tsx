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
    const [Last10Stranger, setLast10Stranger] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [GirlSearchText, setGirlSearchText] = useState("");
    const [StrangerSearchText, setStrangerSearchText] = useState("");


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

  //   const filteredStranger = Last10Stranger.filter((stran: any) => {
  //   const text = StrangerSearchText.toLowerCase();

  //   return (
  //     stran.id?.toLowerCase().includes(text) ||
  //     stran.register_number?.toLowerCase().includes(text) ||
  //     stran.name?.toLowerCase().includes(text) ||
  //      stran.branch?.toLowerCase().includes(text) ||
  //       stran.degree?.toLowerCase().includes(text) ||
  //        stran.room_no?.toLowerCase().includes(text) 
  //   );
  // });

  useEffect(() => {
    loadData();
dashboardGirlandBoy("male");
  dashboardGirlandBoy("female");
dashboardStranger("Stranger");
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
          window.location.reload();
          return REFRESH_TIME;
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
  columns = columns.filter(
    (col) => !["student_image", "time_in"].includes(col)
  );

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

  const dashboardStranger = async (gender) => {
    
    try {
      setLoading(true);

      const FullDashboadData = await CommonService.GetAll(
        `/DashBoardStudentList/${gender}`
      );

      const list = FullDashboadData; 
      
        setLast10Stranger(list);
  

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


  // Circle calculations
const radius = 30;       // smaller than before
  const circumference = 2 * Math.PI * radius;
  const progress = (countdown / REFRESH_TIME) * circumference;

  return (
  <div>

    {/* ===================== AUTO REFRESH ROW ===================== */}
    <div className="flex justify-between mb-4">

      <div className="flex items-center gap-4">

        {/* Text */}
        <p className="text-lg font-semibold">Auto Refresh in</p>

        {/* Countdown Circle */}
        <div className="relative flex justify-center items-center">

          <svg width="80" height="80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e6e6e6"
              strokeWidth="6"
              fill="none"
            />

            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#4cbf86"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          {/* Number */}
          <div className="absolute text-[18px] font-semibold text-[#4cbf86]">
            {countdown}
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div>
        <p className="text-xl">
          Last Update On : <span className="font-bold">{lastUpdate}</span>
        </p>
      </div>
    </div>

    {/* ===================== BOYS & GIRLS PIE CHARTS ===================== */}
    <div className="grid xl:grid-cols-2 gap-6 mb-6">

      {/* BOYS */}
      <div className="panel bg-white shadow rounded-2xl pb-3">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#111">
            <path d="M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33
             23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z" />
          </svg>
          <h5 className="font-semibold text-lg">Boys</h5>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="min-h-[325px] grid place-content-center">
              <span className="animate-spin border-2 border-gray-600 !border-l-transparent rounded-full w-6 h-6"></span>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                {maleInfo?.time_out > 0 && (
                  <button
                    className="flex gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700"
                    onClick={() => InactiveList("male")}
                  >
                    <DownloadIcon /> Download Hostel Out Boys
                  </button>
                )}
              </div>

              {!maleInfo || (maleInfo.time_in == 0 && maleInfo.time_out == 0) ? (
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

      {/* GIRLS */}
      <div className="panel bg-white shadow rounded-2xl pb-3">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#111">
            <path d="M400-80v-240H280l122-308q10-24 31-38t47-14q26 0 47 14t31 38l122 308H560v240H400Zm80-640q-33
             0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z" />
          </svg>
          <h5 className="font-semibold text-lg">Girls</h5>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="min-h-[325px] grid place-content-center">
              <span className="animate-spin border-2 border-gray-600 !border-l-transparent rounded-full w-6 h-6"></span>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-3">
                {femaleInfo?.time_out > 0 && (
                  <button
                    className="flex gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700"
                    onClick={() => InactiveList("female")}
                  >
                    <DownloadIcon /> Download Hostel Out Girls
                  </button>
                )}
              </div>

              {!femaleInfo || (femaleInfo.time_in == 0 && femaleInfo.time_out == 0) ? (
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

    {/* ===================== TABS ===================== */}
    <div className="mb-5 w-full">
  <Tab.Group>
    {/* ---------------- TAB LIST ---------------- */}
    <Tab.List className="mt-3 flex flex-wrap border-b border-gray-300 dark:border-gray-700">
      
      {/* Boys Tab */}
      <Tab as={Fragment}>
        {({ selected }) => (
          <button
            type="button"
            className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
              ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
              }`}
          >
            Boys
          </button>
        )}
      </Tab>

      {/* Girls Tab */}
      <Tab as={Fragment}>
        {({ selected }) => (
          <button
            type="button"
            className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
              ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
              }`}
          >
            Girls
          </button>
        )}
      </Tab>

       {/* Stranger Tab */}
      <Tab as={Fragment}>
        {({ selected }) => (
          <button
            type="button"
            className={`-mb-[1px] px-4 py-2 border-b-2 transition-all duration-200 rounded-t-lg
              ${
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
              }`}
          >
            Stranger
          </button>
        )}
      </Tab>

    </Tab.List>

    {/* ---------------- TAB PANELS ---------------- */}
    <Tab.Panels>
      
      {/* ---------- BOYS PANEL ---------- */}
      <Tab.Panel unmount={false}>
        <div className="active pt-5">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Boys List
            </h2>

            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 border rounded-lg focus:ring focus:ring-purple-300 
                         bg-white text-black dark:bg-gray-800 dark:text-white 
                         dark:border-gray-600"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* BOYS TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border 
                          border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registration Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Degree</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Room No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time Out</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBoys?.map((stu) => (
                    <tr key={stu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={stu.student_image ? stu.student_image : noImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-lg object-cover border-2 
                                     border-gray-300 dark:border-gray-600 shadow-lg"
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {stu.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.register_number}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.degree}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.branch}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.room_no}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {stu.time_in ? (
                          <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 
                                           dark:bg-green-900 dark:text-green-300 font-medium">
                            {formatDateTime(stu.time_in)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {stu.time_out ? (
                          <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 
                                           dark:bg-red-900 dark:text-red-300 font-medium">
                            {formatDateTime(stu.time_out)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Tab.Panel>

      {/* ---------- GIRLS PANEL ---------- */}
      <Tab.Panel unmount={false}>
        <div className="active pt-5">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Girls List
            </h2>

            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 border rounded-lg bg-white text-black 
                         dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring"
              value={GirlSearchText}
              onChange={(e) => setGirlSearchText(e.target.value)}
            />
          </div>

          {/* GIRLS TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border 
                          border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registration Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Degree</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Room No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time Out</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredGirls?.map((stu) => (
                    <tr key={stu.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={stu.student_image ? stu.student_image : noImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-lg object-cover border-2 
                                     border-gray-300 dark:border-gray-600 shadow-lg"
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {stu.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.register_number}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.degree}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.branch}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {stu.room_no}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {stu.time_in ? (
                          <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 
                                           dark:bg-green-900 dark:text-green-300 font-medium">
                            {formatDateTime(stu.time_in)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {stu.time_out ? (
                          <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 
                                           dark:bg-red-900 dark:text-red-300 font-medium">
                            {formatDateTime(stu.time_out)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </Tab.Panel>

       {/* ---------- Stranger PANEL ---------- */}
      <Tab.Panel unmount={false}>
        <div className="active pt-5">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Stranger List
            </h2>

            {/* <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 border rounded-lg focus:ring focus:ring-purple-300 
                         bg-white text-black dark:bg-gray-800 dark:text-white 
                         dark:border-gray-600"
              value={searchText}
              onChange={(e) => setStrangerSearchText(e.target.value)}
            /> */}
          </div>

          {/* Stranger TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border 
                          border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stranger Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time Out</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {Last10Stranger?.map((stran) => (
                    <tr key={stran.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* <img
                          src={stran.student_image ? stran.student_image : noImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-lg object-cover border-2 
                                     border-gray-300 dark:border-gray-600 shadow-lg"
                        /> */}
                        <img
  src={
    stran.image
      ? `https://camlytix.do365tech.in/admin/api/Show/${stran.image}/${stran.date}`
      : noImage
  }
  alt="Profile"
  className="w-24 h-24 rounded-lg object-cover border-2 
             border-gray-300 dark:border-gray-600 shadow-lg"
/>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {stran.time_in_full ? (
                          <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 
                                           dark:bg-green-900 dark:text-green-300 font-medium">
                            {formatDateTime(stran.time_in_full)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {stran.time_out_full ? (
                          <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 
                                           dark:bg-red-900 dark:text-red-300 font-medium">
                            {formatDateTime(stran.time_out_full)}
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </td>

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


  </div>
);

};
export default Dashboard;
