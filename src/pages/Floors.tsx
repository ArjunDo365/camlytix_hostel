import React, { useEffect, useState } from "react";
import { Block, Floor } from "../types/types";
import { Edit, Plus, Save, Trash2, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { CommonHelper } from "../helper/helper";
import { CommonService } from "../service/commonservice.page";

const Floors = () => {
  const [showModal, setShowModal] = useState(false);
  const [floors, setFloors] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null); 
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    block_id: "",
    display_order: 0,
  });

  const [searchText, setSearchText] = useState("");
  const filterData = floors.filter((floor: any) => {
    const text = searchText.toLowerCase();

    return (
      floor.name?.toLowerCase().includes(text) ||
      floor.description?.toLowerCase().includes(text) ||
      floor.block.name?.toLowerCase().includes(text)
    );
  });

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      block_id: "",
      display_order: 0,
    });
    setEditingFloor(null);
  };

  const loadData = async () => {
    try {
      const [floorData, blockData] = await Promise.all([
        CommonService.GetAll("/FloorList"),
        CommonService.GetAll("/BlockList"),
      ]);
      // console.log("data from backend for floor block: ", floorData, blockData);

      if (floorData.length > 0) {
        setFloors(floorData);
      } 
      else setFloors([]);

      if (blockData.length > 0) {
        setBlocks(blockData);
      } 
      else setBlocks([]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (floor: Floor) => {
    setEditingFloor(floor);
    setFormData({
      name: floor.name,
      description: floor.description,
      block_id: floor.block_id ?? "",
      display_order: floor.display_order ?? 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (floor: Floor) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to Delete " + " " + floor.name + "!",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "red",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then(async (result) => {
      if (result.value) {
        let res: any;
        res = await CommonService.CommonDelete(`/FloorDelete/${floor.id}`);
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

    if (formData.block_id === "" || !formData.block_id) {
      CommonHelper.ErrorToaster("Please select a block");
      return;
    }
    if (!formData.display_order || formData.display_order <= 0) {
      CommonHelper.ErrorToaster("please enter the display order");
      return;
    }
    try {
      // console.log("payload for block api: ", editingBlock?.id, formData);
      let result;
      if (editingFloor) {
        const pay = { ...formData, id: editingFloor.id };
        result = await CommonService.CommonPut(pay, `/FloorUpdate`);
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
      } else {
        result = await CommonService.CommonPost(
          { ...formData, created_by_id: "b5cec1c6-8783-4e60-b88b-d49d8ae658a7" },
          "/FloorInsert"
        );
        if (result.Type == "S") CommonHelper.SuccessToaster(result.Message);
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

  // console.log('checking state: ',formData)

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white-light">Floor Details</h2>
          <p className="text-gray-600 dark:text-white-light">Manage Floors in the hostel</p>
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
            Add Floor
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
                  Floor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterData.map((floor) => (
                <tr key={floor.id} className="hover:bg-gray-50 dark:text-white-light dark:bg-black dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {floor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div> */}
                      <div className="">
                        <div className="text-sm font-medium text-gray-900 dark:text-white-light">
                          {floor.name}
                        </div>
                        {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {floor.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {floor?.block?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(floor)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 rounded-full p-2"
                      >
                        <Edit size={20} className="!text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(floor)}
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
          <div className="bg-white rounded-xl max-w-md w-full border dark:border-gray-200 dark:bg-black dark:text-white-light">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white-light">
                {editingFloor ? "Edit Floor" : "Add Floor"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Name
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-white-light dark:bg-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-white-light dark:bg-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <select
                  value={formData.block_id}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      block_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-white-light dark:bg-black"
                  required
                >
                  <option value={0}>-- Select Block --</option>
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => {
                    const valueConvert = e.target.value ? e.target.value : "0";
                    setFormData((prevData) => ({
                      ...prevData,
                      display_order: parseInt(valueConvert),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-white-light dark:bg-black"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors flex gap-2 items-center border dark:border-gray-light"
                >
                  <XCircle />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex gap-2 items-center"
                >
                  <Save />
                  {editingFloor ? "Update" : "Create"} Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Floors;
