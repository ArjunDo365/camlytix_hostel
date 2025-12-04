import React, { useEffect, useState } from "react";
import { AppSetting } from "../types/types";
import { Edit, Save, XCircle } from "lucide-react";
import { CommonHelper } from "../helper/helper";
import { CommonService } from "../service/commonservice.page";

const AppSettings = () => {
  const [showModal, setShowModal] = useState(false);
  const [AppSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [editingAppSetting, setEditingAppSetting] = useState<AppSetting | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    keyname: "",
    keyvalue: "",
  });

  const [searchText, setSearchText] = useState("");
  const filterData = AppSettings.filter((app: any) => {
    const text = searchText.toLowerCase();

    return (
      app.keyname?.toLowerCase().includes(text) ||
      app.keyvalue?.toLowerCase().includes(text)
    );
  });

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      keyname: "",
      keyvalue: "",
    });
    setEditingAppSetting(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const AppSettingData = await CommonService.GetAll("/AppSettingsList");
      // console.log("checking app settings : ", AppSettingData);
      // if (AppSettingData.length>0 && Array.isArray(AppSettingData)) {
      //   setAppSettings(AppSettingData.data);
      // } else {
      //   setAppSettings([]);
      // }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (AppSetting: AppSetting) => {
    setEditingAppSetting(AppSetting);
    setFormData({
      keyname: AppSetting.keyname,
      keyvalue: AppSetting.keyvalue,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppSetting) return;

    try {
      const payload = {
        keyname: formData.keyname,
        keyvalue: formData.keyvalue,
        id: editingAppSetting?.id,
      };

      const result = await CommonService.CommonPut(
        payload,
        `AppSettingsUpdate`
      );

      if (result.Type == "S") {
        CommonHelper.SuccessToaster(result.Message);
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        CommonHelper.ErrorToaster(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving AppSetting:", error);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white-light">App Settings</h2>
          <p className="text-gray-600 dark:text-white-light">Manage App Settings in the hostel</p>
        </div>
        <div className="flex gap-2">
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterData.map((AppSetting) => (
                <tr key={AppSetting.id} className="hover:bg-gray-50 dark:text-white-light dark:bg-black dark:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {(AppSetting.keyname?.charAt(0) || "").toUpperCase()}
                          </span>
                        </div>
                      </div> */}
                      <div className="">
                        <div className="text-sm font-medium text-gray-900">
                          {AppSetting.keyname || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {AppSetting.keyvalue || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(AppSetting)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 rounded-full p-2"
                      >
                        <Edit size={20} className="!text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full dark:border-white-light dark:bg-black">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white-light">
                {editingAppSetting ? "Edit AppSetting" : "Add AppSetting"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {" "}
                  Name
                </label>
                <input
                  type="text"
                  value={formData.keyname}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-white-light dark:bg-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={formData.keyvalue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      keyvalue: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-white-light dark:bg-black"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors flex gap-2 border dark:border-white-light"
                >
                  <XCircle />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex gap-2"
                >
                  <Save />
                  Update App Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSettings;
