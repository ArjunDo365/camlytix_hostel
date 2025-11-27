import React, { useEffect, useState } from "react";
import { Nvr, Section } from "../types/types";
import { Edit, Plus, Save, Trash2, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { CommonHelper } from "../helper/helper";
import "flatpickr/dist/flatpickr.css";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import { CommonService } from "../service/commonservice.page";

const NVR = () => {
  const [showModal, setShowModal] = useState(false);
  const [nvrs, setNvrs] = useState<Nvr[]>([]);
  const [floors, setFloors] = useState<Section[]>([]);
  const [editingNvr, setEditingNvr] = useState<Nvr | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    section_id: "",
    asset_no: "",
    serial_number: "",
    model_name: "",
    ip_address: "",
    manufacturer: "",
    vendor: "",
    install_date: moment().format("DD-MM-YYYY"),
    status: 0,
  });
  const [errors, setErrors] = useState({
    ip_address: "",
  });

  const [searchText, setSearchText] = useState("");

  const filterData = nvrs.filter((nvr: any) => {
    const text = searchText.toLowerCase();

    return (
      nvr.asset_no?.toLowerCase().includes(text) ||
      nvr.model_name?.toLowerCase().includes(text) ||
      nvr.ip_address?.toLowerCase().includes(text) ||
      nvr.location_name?.toLowerCase().includes(text) ||
      nvr.floor_name?.toLowerCase().includes(text) ||
      nvr.block_name?.toLowerCase().includes(text)
    );
  });

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      id: "",
      section_id: "",
      asset_no: "",
      serial_number: "",
      model_name: "",
      ip_address: "",
      manufacturer: "",
      vendor: "",
      install_date: moment().format("DD-MM-YYYY"),
      status: 0,
    });
    setEditingNvr(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [nvrData, sectionData] = await Promise.all([
        CommonService.GetAll("/NvrList"),
        CommonService.GetAll("/SectionList"),
      ]);
      console.log("data from backend for nvr,section: ", nvrData, sectionData);

      if (nvrData.length > 0) {
        setNvrs(nvrData);
      } else setNvrs([]);

      if (sectionData.length > 0) {
        setFloors(sectionData);
      } else setFloors([]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nvr: Nvr) => {
    setEditingNvr(nvr);
    setFormData({
      id: nvr.id,
      section_id: nvr.section_id,
      asset_no: nvr.asset_no,
      serial_number: nvr.serial_number,
      model_name: nvr.model_name,
      ip_address: nvr.ip_address,
      manufacturer: nvr.manufacturer,
      vendor: nvr.vendor,
      install_date: nvr.install_date,
      status: nvr.status ?? 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (n: Nvr) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to Delete " + " " + n.asset_no + "!",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then(async (result) => {
      if (result.value) {
        let res: any;
        res = await CommonService.CommonDelete(`/NvrDelete/${n.id}`);
        // console.log("resp from delete: ", res);
        if ((res.Type = "S")) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.section_id === "") {
      CommonHelper.ErrorToaster("Please select a location");
      return;
    }
    if (!formData.install_date) {
      CommonHelper.ErrorToaster("please enter the installed date");
      return;
    }
    if (!formData.ip_address) {
      CommonHelper.ErrorToaster("IP Address is required");
      return;
    } else if (!isValidIP(formData.ip_address)) {
      CommonHelper.ErrorToaster("Invalid IP address format");
      return;
    }
    try {
      // console.log("payload for block api: ", editingBlock?.id, formData);
      let result;
      if (editingNvr) {
        // console.log("payload for block update: ", editingNvr?.id, formData);
        const pay = { ...formData, id: editingNvr.id };
        result = await CommonService.CommonPut(formData, `/NvrUpdate`);
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
        // console.log("result on edit block submit", result);
      } else {
        // console.log("payload for block submit: ", formData);
        result = await CommonService.CommonPost(
          {
            ...formData,
            created_by_id: "b5cec1c6-8783-4e60-b88b-d49d8ae658a7",
          },
          "/NvrInsert"
        );
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
        console.log("result on block submit", result);
      }

      if (result.Type == "S") {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        CommonHelper.ErrorToaster(result.message || "Operation failed");
        // alert(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving NVR:", error);
      CommonHelper.ErrorToaster("An error occurred");
      // alert("An error occurred");
    }
  };

  const updateNvrStatus = async (payload: typeof formData) => {
    try {
      console.log("Updating NVR with full data:", payload);

      const pay = {
        id: payload.id,
        section_id: payload.section_id,
        asset_no: payload.asset_no,
        serial_number: payload.serial_number,
        model_name: payload.model_name,
        ip_address: payload.ip_address,
        manufacturer: payload.manufacturer,
        vendor: payload.vendor,
        install_date: payload.install_date,
        status: payload.status,
      };

      const result = await CommonService.CommonPut(pay, `/NvrUpdate`);

      if (result.Type == "S") {
        CommonHelper.SuccessToaster(
          result.message || "Status updated successfully"
        );
        await loadData(); // refresh table
      } else {
        CommonHelper.ErrorToaster(result.message || "Failed to update NVR");
      }
    } catch (error) {
      console.error("Error updating NVR:", error);
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
          <h2 className="text-2xl font-bold text-gray-900">NVR Master</h2>
          <p className="text-gray-600">Manage NVRs in the hostel</p>
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
            Add NVR
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
            <tbody className="bg-white divide-y divide-gray-200">
              {filterData.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
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
                    <div className="text-sm font-medium text-gray-900">
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
                      {n.block_name} &gt; {n.floor_name} &gt; {n.location_name}
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
                            await updateNvrStatus(payload);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-xl max-w-[900px] w-full z-60">
            <div className="p-6 border-b border-gray-200 relative z-60">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNvr ? "Edit NVR" : "Add NVR"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid xl:grid-cols-2 gap-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  >
                    <option value="">-- Select Location --</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.block_name} &gt; {f.floor_name} &gt; {f.name}
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
                    onChange={(date: Date[]) => {
                      // console.log("SELECTED DATE: ", date);
                      setFormData((prevData) => ({
                        ...prevData,
                        install_date: date[0]
                          ? moment(date[0]).format("YYYY-MM-DD")
                          : "",
                      }));
                    }}
                  />
                </div>
                {editingNvr && (
                  <div>
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
                  {editingNvr ? "Update" : "Create"} NVR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NVR;
