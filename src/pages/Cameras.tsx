import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { CommonHelper } from "../helper/helper";
import { Camera, Nvr, Section } from "../types/types";
import { Edit, Plus, Save, Trash2, XCircle } from "lucide-react";
import "flatpickr/dist/flatpickr.css";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import { CommonService } from "../service/commonservice.page";

const Cameras = () => {
  const [showModal, setShowModal] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [nvrs, setNvrs] = useState<Nvr[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    section_id: "",
    nvr_id: "",
    asset_no: "",
    serial_number: "",
    model_name: "",
    ip_address: "",
    port: 0,
    manufacturer: "",
    vendor: "",
    install_date: moment().format("DD-MM-YYYY"),
    status: 0,
    type: ""    
  });
  const [errors, setErrors] = useState({
    ip_address: "",
    port: "",
  });

  const [searchText, setSearchText] = useState("");

  const filterData = cameras?.filter((cam: any) => {
    const text = searchText.toLowerCase();

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
  }, []);

  const resetForm = () => {
    setFormData({
      id: "",
      section_id: "",
      nvr_id: "",
      asset_no: "",
      serial_number: "",
      model_name: "",
      ip_address: "",
      port: 0,
      manufacturer: "",
      vendor: "",
      install_date: moment().format("DD-MM-YYYY"),
      status: 0,
      type: ""
    });
    setEditingCamera(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [cameraData, nvrData, sectionData] = await Promise.all([
        CommonService.GetAll("/CameraList"),
        CommonService.GetAll("/NvrList"),
        CommonService.GetAll("/SectionList"),
      ]);
      // console.log(
      //   "data from backend for camera nvr section: ",
      //   cameraData,
      //   nvrData,
      //   sectionData
      // );

      if (cameraData.length > 0) {
        setCameras(cameraData);
      } else setCameras([]);
      if (nvrData.length > 0) {
        setNvrs(nvrData);
      } else setNvrs([]);
      if (sectionData.length > 0) {
        setSections(sectionData);
      } else setSections([]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cam: Camera) => {
    setEditingCamera(cam);
    setFormData({
      id: cam.id,
      section_id: cam.section_id,
      nvr_id: cam.nvr_id,
      asset_no: cam.asset_no,
      serial_number: cam.serial_number,
      model_name: cam.model_name,
      ip_address: cam.ip_address,
      manufacturer: cam.manufacturer,
      vendor: cam.vendor,
      install_date: cam.install_date,
      port: cam.port,
      status: cam.status,
      type: cam.type
    });
    setShowModal(true);
  };

  const handleDelete = async (cam: Camera) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to Delete " + " " + cam.asset_no + "!",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then(async (result) => {
      if (result.value) {
        let res: any;
        if (cam.id == null) {
          CommonHelper.ErrorToaster("Invalid camera id");
          return;
        }
        res = await CommonService.CommonDelete(`/CameraDelete/${cam.id}`);
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

  const isValidIP = (ip: string) => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  // Validate port number
  const isValidPort = (port: string) => {
    const portNumber = parseInt(port, 10);
    return portNumber >= 1 && portNumber <= 65535;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ip_address) {
      CommonHelper.ErrorToaster("IP Address is required");
      return;
    } else if (!isValidIP(formData.ip_address)) {
      CommonHelper.ErrorToaster("Invalid IP address format");
      return;
    }
    if (!formData.port) {
      CommonHelper.ErrorToaster("port is required");
      return;
    } else if (!isValidPort(formData.port.toString())) {
      CommonHelper.ErrorToaster("Invalid port number");
      return;
    }
    try {
      // console.log("payload for block api: ", editingBlock?.id, formData);
      let result;
      if (editingCamera) {
        // ensure id is present before calling update
        if (editingCamera.id == null) {
          CommonHelper.ErrorToaster("Invalid camera id");
          return;
        }
        // console.log("payload for block update: ", formData);
        const pay = { ...formData, id: editingCamera.id };
        result = await CommonService.CommonPut(pay, `/CameraUpdate`);
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
        // console.log("result on edit block submit", result);
      } else {
        // console.log("payload for block submit: ", formData);
        result = await CommonService.CommonPost(
          {
            ...formData,
            created_by_id: "b5cec1c6-8783-4e60-b88b-d49d8ae658a7",
          },
          "/CameraInsert"
        );
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
        // console.log("result on block submit", result);
      }

      if (result && result.Type == "S") {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        CommonHelper.ErrorToaster(
          (result && result.Message) || "Operation failed"
        );
        // alert(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving Camera:", error);
      CommonHelper.ErrorToaster("An error occurred");
      // alert("An error occurred");
    }
  };

  const updateCameraStatus = async (payload: typeof formData) => {
    try {
      // console.log("Updating NVR with full data:", payload);
      const pay = {
        id: payload.id,
        section_id: payload.section_id,
        nvr_id: payload.nvr_id,
        asset_no: payload.asset_no,
        serial_number: payload.serial_number,
        model_name: payload.model_name,
        ip_address: payload.ip_address,
        manufacturer: payload.manufacturer,
        vendor: payload.vendor,
        install_date: payload.install_date,
        port: payload.port,
        status: payload.status,
      };
      const result = await CommonService.CommonPut(pay, `/CameraUpdate`);

      if (result.Type == "S") {
        CommonHelper.SuccessToaster(
          result.Message || "Status updated successfully"
        );
        await loadData(); // refresh table
      } else {
        CommonHelper.ErrorToaster(result.Message || "Failed to update Camera");
      }
    } catch (error) {
      console.error("Error updating Camera:", error);
      CommonHelper.ErrorToaster("An error occurred");
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white-light">Camera Details</h2>
          <p className="text-gray-600 dark:text-white-light">Manage Cameras in the hostel</p>
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
            Add Camera
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 border rounded-lg focus:ring focus:ring-purple-300 text-black dark:text-white-light dark:bg-black"
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
                  Asset No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Working on
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Is Working
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Working on
                </th> */}
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Name
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-black dark:!text-white-light">
              {filterData?.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10"> */}
                    {/* <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {n?.asset_no?.charAt(0)?.toUpperCase()}
                          </span>
                        </div> */}
                    {/* </div>
                      <div className=""> */}
                    <div className="text-sm font-medium text-gray-900 dark:text-white-light">
                      {n.asset_no}
                    </div>
                    {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                    {/* </div>
                    </div> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{n.model_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {n?.section?.floor?.block?.name} &gt; {n?.section?.floor?.name} &gt;{" "}
                      {n.section.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{n.ip_address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {n.last_working_on
                        ? new Date(n.last_working_on)
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
                      {n.is_working == 0 ? (
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
                    <div className="text-sm flex items-center">
                      <label className="w-12 h-6 relative block">
                        <input
                          type="checkbox"
                          className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                          checked={!!n.status}
                          onChange={async (
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const updatedStatus = e.target.checked ? 1 : 0;

                            // Create full payload for this row, updating only status
                            const payload = { ...n, status: updatedStatus };

                            // Optionally update local formData if needed
                            setFormData(payload);

                            // Call API to update the full NVR data
                            await updateCameraStatus(payload);
                          }}
                        />

                        <span
                          className="bg-[#ebedf2] 
                         block h-full rounded-full 
                         border-2 border-blue-300
                         peer-checked:bg-blue-600 
                         peer-checked:border-blue-600
                         before:absolute before:left-1 
                         before:bg-white before:peer-checked:bg-white 
                         before:bottom-1 before:w-4 before:h-4 
                         before:rounded-full peer-checked:before:left-7 
                         before:transition-all before:duration-300"
                        ></span>
                      </label>

                      {/* <span className="ml-2 font-medium">
                     {n.status == 0 ? "Inactive" : "Active"}
                   </span> */}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{n.last_working_on}</div>
                  </td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(n)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 rounded-full p-2"
                      >
                        <Edit size={20} className="!text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(n)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4 dark:border-gray-200">
          <div className="bg-white rounded-xl max-w-[900px] w-full border relative z-60 dark:text-white-light dark:bg-black dark:border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white-light">
                {editingCamera ? "Edit Camera" : "Add Camera"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Number
                  </label>
                  <input
                    type="text"
                    value={formData.asset_no}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        asset_no: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        serial_number: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.model_name}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        model_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        manufacturer: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        vendor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NVR
                  </label>
                  <select
                    value={formData.nvr_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nvr_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  >
                    <option value={0}>-- Select NVR --</option>
                    {nvrs.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.asset_no}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        ip_address: e.target.value,
                      }));
                      if (!isValidIP(formData.ip_address)) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          ip_address: "IP Address is invalid",
                        }));
                      } else {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          ip_address: "",
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                  {errors.ip_address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ip_address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={formData.port}
                    onChange={(e) => {
                      let val = e.target.value;

                      if (!isValidPort(val)) {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          port: "Port number must be between 1 and 65535",
                        }));
                        setFormData((prevData) => ({
                          ...prevData,
                          port: 0,
                        }));
                      } else {
                        setErrors((prevErrors) => ({
                          ...prevErrors,
                          port: "",
                        }));
                        setFormData((prevData) => ({
                          ...prevData,
                          port: parseInt(val),
                        }));
                        // console.log(
                        //   "checking on change value: ",
                        //   parseInt(val)
                        // );
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  />
                  {errors.port && (
                    <p className="text-red-500 text-sm mt-1">{errors.port}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Camera Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  >
                    <option value={0}>-- Select Type --</option>
                    <option key="in" value="in">
                      IN
                    </option>
                    <option key="out" value="out">
                      OUT
                    </option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        model: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={formData.section_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        section_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:border-white-light dark:bg-black"
                    required
                  >
                    <option value={0}>-- Select Location --</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section?.floor?.block?.name} &gt; {section?.floor?.name} &gt;{" "}
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installed Date
                  </label>
                  <Flatpickr
                    value={moment(formData.install_date).format("DD-MM-YYYY")}
                    options={{
                      dateFormat: "d-m-Y",
                      position: "auto left",
                    }}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    onChange={(date: Date[]) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        install_date: date[0]
                          ? moment(date[0]).format("YYYY-MM-DD")
                          : "",
                      }))
                    }
                  />
                </div>
                {editingCamera && (
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                    <label className="w-12 h-6 relative block">
                      <input
                        type="checkbox"
                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                        id="custom_switch_checkbox1"
                        checked={!!formData.status}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prevData) => ({
                            ...prevData,
                            status: e.target.checked ? 1 : 0,
                          }))
                        }
                      />

                      <span
                        className="bg-[#ebedf2] 
                       block h-full rounded-full 
                       border-2 border-blue-300
                       peer-checked:bg-blue-600 
                       peer-checked:border-blue-600
                       before:absolute before:left-1 
                       before:bg-white before:peer-checked:bg-white 
                       before:bottom-1 before:w-4 before:h-4 
                       before:rounded-full peer-checked:before:left-7 
                       before:transition-all before:duration-300"
                      ></span>
                    </label>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors flex gap-2 items-center border dark:border-white-light"
                >
                  <XCircle />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex gap-2 items-center"
                >
                  <Save />
                  {editingCamera ? "Update" : "Create"} Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cameras;
