import React, { useEffect, useRef, useState } from "react";
import { DateRangePicker } from "react-date-range";
import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import noImage from "../../public/assets/images/noImg.png";
import Select from "react-select";
import { Download, ListFilterPlus } from "lucide-react";
import moment from "moment";
import { CommonHelper } from "../helper/helper";

const studentsData = [
  { id: 1, name: "John Doe", registration_number: "REG001" },
  { id: 2, name: "Jane Smith", registration_number: "REG002" },
  { id: 3, name: "Mike Johnson", registration_number: "REG003" },
  { id: 4, name: "Sarah Williams", registration_number: "REG004" },
];

const col = ["id", "name", "registration_number"];

const AttendanceDetails = () => {
  const [searchText, setSearchText] = useState("");
  const [students, setStudents] = useState<any[]>(studentsData);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const filterData = students?.filter((st: any) => {
    const text = searchText?.toLowerCase();
    return st.name?.toLowerCase().includes(text);
  });

  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filterData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // -1 represents ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = students.map((student) => ({
    value: student.id,
    label: `${student.name} (${student.registration_number})`,
    student: student,
  }));

  const handleChange = (selectedOption) => {
    setSelectedStudent(selectedOption);
    console.log("Selected student:", selectedOption?.student);
  };

  const staticRanges = [
    {
      label: "Today",
      range: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          isSameDay(range.startDate, definedRange.startDate) &&
          isSameDay(range.endDate, definedRange.endDate)
        );
      },
    },
    {
      label: "Yesterday",
      range: () => ({
        startDate: addDays(new Date(), -1),
        endDate: addDays(new Date(), -1),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          isSameDay(range.startDate, definedRange.startDate) &&
          isSameDay(range.endDate, definedRange.endDate)
        );
      },
    },
    {
      label: "Last 7 Days",
      range: () => ({
        startDate: addDays(new Date(), -6),
        endDate: new Date(),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          isSameDay(range.startDate, definedRange.startDate) &&
          isSameDay(range.endDate, definedRange.endDate)
        );
      },
    },
    {
      label: "Last Month",
      range: () => ({
        startDate: startOfMonth(subMonths(new Date(), 1)),
        endDate: endOfMonth(subMonths(new Date(), 1)),
      }),
      isSelected(range) {
        const definedRange = this.range();
        return (
          isSameDay(range.startDate, definedRange.startDate) &&
          isSameDay(range.endDate, definedRange.endDate)
        );
      },
    },
  ];

  const formatDateRange = () => {
    const start = format(dateRange[0].startDate, "MMM dd, yyyy");
    const end = format(dateRange[0].endDate, "MMM dd, yyyy");
    return `${start} - ${end}`;
  };

  const handleSubmit = () => {
    if (!dateRange[0].startDate) {
      CommonHelper.ErrorToaster("Enter Start Date");
      return;
    } else if (!dateRange[0].endDate) {
      CommonHelper.ErrorToaster("Enter End Date");
      return;
    } else if (!selectedStudent?.student?.registration_number) {
      CommonHelper.ErrorToaster("Select student");
      return;
    }

    const payload = {
      start_data: moment(dateRange[0].startDate).format("YYYY-MM-DD"),
      end_date: moment(dateRange[0].endDate).format("YYYY-MM-DD"),
      registration_number: selectedStudent.student.registration_number,
    };
    console.log("api payload: ", payload);
  };

  const capitalize = (text: any) => {
    return text
      .replace("_", " ")
      .replace("-", " ")
      .toLowerCase()
      .split(" ")
      .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");
  };

  const exportTable = (type: any) => {
    let columns: any = col;
    let records = filterData;
    let filename = "table";

    let newVariable: any;
    newVariable = window.navigator;
    let coldelimiter = ";";
    let linedelimiter = "\n";
    let result = columns
      .map((d: any) => {
        return capitalize(d);
      })
      .join(coldelimiter);
    result += linedelimiter;
    // eslint-disable-next-line array-callback-return
    records.map((item: any) => {
      // eslint-disable-next-line array-callback-return
      columns.map((d: any, index: any) => {
        if (index > 0) {
          result += coldelimiter;
        }
        let val = item[d] ? item[d] : "";
        result += val;
      });
      result += linedelimiter;
    });

    if (result == null) return;
    if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
      var data =
        "data:application/csv;charset=utf-8," + encodeURIComponent(result);
      var link = document.createElement("a");
      link.setAttribute("href", data);
      link.setAttribute("download", filename + ".csv");
      link.click();
    } else {
      var blob = new Blob([result]);
      if (newVariable.msSaveOrOpenBlob) {
        newVariable.msSaveBlob(blob, filename + ".csv");
      }
    }
  };

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Attendance Details
          </h2>
          <p className="text-gray-600">
            Search attendence details of students in the hostel
          </p>
        </div>
        <div className="ltr:ml-auto rtl:mr-auto mb-6 flex items-center justify-between">
          <input
            type="text"
            className="form-input w-auto"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            onClick={exportTable}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={20} />
            Download Data
          </button>
        </div>
        <div className="mb-4.5 flex md:items-center md:flex-row flex-col gap-5">
          <div className="flex flex-wrap gap-5 items-center w-full border-2 border-gray-200 rounded-lg p-3 justify-between">
            <div className="flex items-center gap-5">
              <label className="block text-sm font-medium text-gray-700 m-0">
                Select Date
              </label>
              <div className="relative" ref={wrapperRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-64 px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                >
                  <span className="text-gray-700">{formatDateRange()}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-2 z-50 shadow-xl rounded-lg overflow-hidden bg-white">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={(item) => setDateRange([item.selection])}
                      staticRanges={staticRanges}
                      inputRanges={[]}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="block text-sm font-medium text-gray-700 m-0">
                Select Student
              </label>
              <Select
                value={selectedStudent}
                onChange={handleChange}
                options={options}
                placeholder="Search student by name or register number..."
                isClearable
                isSearchable
                className="react-select-container w-[250px]"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderColor: "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 50,
                  }),
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ListFilterPlus size={20} />
              Apply filter
            </button>
          </div>
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
                    Check-Out Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-In Time
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems?.map((stu) => (
                  <tr key={stu.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={stu.student_image ? stu.student_image : noImage}
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
                        {stu.registration_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {stu.check_out ?? "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {stu.check_in ?? "--"}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(stu)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 rounded-full p-2"
                      >
                        <Edit size={20} className="!text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(stu)}
                        className="bg-red-600 hover:bg-red-700 flex items-center gap-1 rounded-full p-2"
                      >
                        <Trash2 size={20} className="!text-white" />
                      </button>
                    </div>
                  </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filterData.length > 0 && (
            <div className="flex items-center justify-between m-3 px-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filterData.length)} of{" "}
                {filterData.length} entries
              </div>
              <ul className="inline-flex items-center gap-1">
                <li>
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex justify-center font-semibold px-3.5 py-2 rounded transition border-2 ${
                      currentPage === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-dark hover:text-primary border-white-light dark:border-[#191e3a] hover:border-primary dark:hover:border-primary dark:text-white-light"
                    }`}
                  >
                    Prev
                  </button>
                </li>
                {getPageNumbers().map((pageNum, index) => (
                  <li key={index}>
                    {pageNum === -1 ? (
                      <span className="flex justify-center px-3.5 py-2">
                        ...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex justify-center font-semibold px-3.5 py-2 rounded transition border-2 ${
                          currentPage === pageNum
                            ? "text-primary border-primary dark:border-primary dark:text-white-light"
                            : "text-dark hover:text-primary border-white-light dark:border-[#191e3a] hover:border-primary dark:hover:border-primary dark:text-white-light"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )}
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex justify-center font-semibold px-3.5 py-2 rounded transition border-2 ${
                      currentPage === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "text-dark hover:text-primary border-white-light dark:border-[#191e3a] hover:border-primary dark:hover:border-primary dark:text-white-light"
                    }`}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetails;
