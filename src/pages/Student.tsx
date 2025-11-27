import { Edit, Plus, Save, Trash2, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Student as stu } from "../types/types";
import { CommonService } from "../service/commonservice.page";
import { CommonHelper } from "../helper/helper";
import Swal from "sweetalert2";
import IconX from "../components/Icon/IconX";
import noImage from "../../public/assets/images/noImg.png";

const Student = () => {
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<stu[]>([]);
  const [editingStudent, setEditingStudent] = useState<stu | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    register_number: "",
    mobile_number: "",
    email: "",
    room_no: "",
    student_image: "",
    degree: "",
    branch: "",
    display_order: 1,
  });

  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prevData) => ({
      ...prevData,
      mobile_number: value,
    }));

    const errorMessage = validateMobileNumber(value);
    setError(errorMessage);
  };

  const filterData = students?.filter((st: any) => {
    const text = searchText?.toLowerCase();

    return st.name?.toLowerCase().includes(text);
  });

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "",
      register_number: "",
      mobile_number: "",
      email: "",
      room_no: "",
      student_image: "",
      degree: "",
      branch: "",
      display_order: 1,
    });
    setEditingStudent(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const stuData = await CommonService.GetAll("/StudentList");

      // console.log("data from backend for blocks: ", blockData);

      if (stuData.length > 0) {
        setStudents(stuData);
      } else setStudents([]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s: stu) => {
    setEditingStudent(s);
    setFormData({ ...s });
    setShowModal(true);
  };

  const handleDelete = async (stu: stu) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to Delete " + " " + stu.name + "!",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then(async (result) => {
      if (result.value) {
        let res: any;
        res = await CommonService.CommonDelete(`/StudentDelete/${stu.id}`);
        // console.log("resp from delete: ", res);
        if (res.Type == "S") {
          await loadData();
          CommonHelper.SuccessToaster(res.Message);
        } else {
          CommonHelper.ErrorToaster(res.Message);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.display_order <= 0) {
      CommonHelper.ErrorToaster("please enter the display order");
      return;
    }

    try {
      console.log("payload for block api: ", editingStudent, formData);
      let result;
      if (editingStudent) {
        const pay = { ...formData, id: editingStudent.id };
        // console.log('payload for block update: ',formData);
        result = await CommonService.CommonPut(pay,`/StudentUpdate`);
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
        // console.log('result on edit block submit',result);
      } else {
        // console.log('payload for block submit: ',formData);
        result = await CommonService.CommonPost(
          {
            ...formData,
            created_by_id: "b5cec1c6-8783-4e60-b88b-d49d8ae658a7",
          },
          "/StudentInsert"
        );
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
        // console.log('result on block submit',result);
      }

      if (result.Type == "S") {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        CommonHelper.ErrorToaster(result.error || "Operation failed");
        // alert(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving block:", error);
      CommonHelper.ErrorToaster("An error occurred");
      // alert("An error occurred");
    }
  };

  const validateMobileNumber = (value) => {
    const regex = /^[0-9]{10}$/; // Ensures exactly 10 digits
    if (!value) return "Mobile number is required.";
    if (!regex.test(value)) return "Mobile number must be exactly 10 digits.";
    return ""; // Return an empty string if valid
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (event, inputType) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileType = file.type;
    if (fileType.startsWith("image/")) {
      const pbase64 = await convertToBase64(file);
      // console.log("base64 image string: ", base64);
      // const removePrefix = (base64 as string).split(",")[1];
      setFormData((prevData) => ({
        ...prevData,
        student_image: pbase64 as string,
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Master</h2>
          <p className="text-gray-600">Manage Student in the hostel</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Student
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 border rounded-lg focus:ring focus:ring-purple-300 text-black"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Number
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Name
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterData?.map((stu) => (
                <tr key={stu.id} className="hover:bg-gray-50">
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
                    <div className="text-sm text-gray-500">{stu.room_no}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-[75vw] w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStudent ? "Edit Student" : "Add Student"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid xl:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  >
                    <option value="" key={0}>
                      -- Select Gender --
                    </option>
                    <option key={"male"} value={"male"}>
                      Male
                    </option>
                    <option key={"female"} value={"female"}>
                      Female
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.register_number}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        register_number: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.mobile_number}
                    onChange={handleMobileNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.room_no}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        room_no: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        degree: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        branch: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => {
                      const valueConvert = e.target.value
                        ? e.target.value
                        : "0";
                      setFormData((prevData) => ({
                        ...prevData,
                        display_order: parseInt(valueConvert),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div className="relative  w-full border-2 border-blue-500 rounded-md p-3 flex items-center justify-evenly w-full">
                  <label
                    htmlFor="student_image"
                    className="required-label text-center m-0"
                  >
                    Image
                  </label>

                  <div className="text-center">
                    <input
                      id="student"
                      type="file"
                      accept=".jpeg, .jpg, .png"
                      className="opacity-0 absolute z-[-1]"
                      // required
                      onChange={(event) =>
                        handleFileChange(event, "student_image")
                      }
                    />
                    <label
                      htmlFor="student_image"
                      className="cursor-pointer m-0 inline-block py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                    >
                      Choose File
                    </label>
                    <br />
                    {/* <span className="text-danger">
                    {userValidation["student_image"]}
                  </span> */}
                  </div>

                  <div className="relative flex justify-center">
                    <img
                      src={
                        formData.student_image
                          ? formData.student_image
                          : noImage
                      }
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-lg"
                    />

                    {formData.student_image && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev: any) => ({
                            ...prev,
                            student_image: null,
                          }))
                        }
                        className="absolute top-0 left-[100%] bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600"
                      >
                        <IconX />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors flex gap-2 items-center"
                >
                  <XCircle />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex gap-2 items-center"
                >
                  <Save />
                  {editingStudent ? "Update" : "Create"} Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;
