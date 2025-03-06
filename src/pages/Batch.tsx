
import React, { useEffect, useMemo, useState } from "react";
import CentralizedTable from "../components/CentralizedTable";
import ModalOpenButton from "../components/ui/ModelOpenButton";
import SearchInputBox from "../components/ui/SearchInputBox";
import { DownloadCloud, UploadCloud } from "lucide-react";
import { Add } from "@mui/icons-material";
import TemplateDownloadButton from "../components/ui/TemplateDownloadButton";
import { batchColumns } from "../utils/tableColumns";
import { getTableData } from "../services/state/api/tableDataApi";
import SearchDropdown from "../components/ui/SearchDropdown";
import Loader from "../components/ui/Loader";
import useDebounce from "../services/state/useDebounce";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Column } from "react-table";



const Batch: React.FC = () => {

  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState<string>("");
  const [searchKeyLabel, setSearchKeyLabel] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 1000);

    const columns = useMemo<Column<any>[]>(() => batchColumns(navigate) as Column<any>[], [navigate]);


  const { data: fetchedData, isSuccess, isLoading } = useQuery({
    queryKey: ["batchData", "batch", searchKey, debouncedSearchValue],
    queryFn: () => getTableData("batch", searchKey, debouncedSearchValue),
  });

  useEffect(() => {
    if (isSuccess && fetchedData?.data?.data) {
      setFilteredData(fetchedData.data.data);
    }
  }, [fetchedData, isSuccess]);


  const handleSearch = (value: string) => {
    setSearchValue(value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = fetchedData.data.filter((item: any) =>
      item.vsSchemeName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleDropdownSelect = (option: { label: string; value: string }) => {
    setSearchKey(option.value);
    setSearchKeyLabel(option.label);
    setSearchValue("");
  };

  if (isLoading) {
    return <Loader />;
  }


  return (
    <>

      <div className="">
        <p className="text-2xl font-bold mb-4">List Of Batches</p>
        <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4">
          <div className="flex items-center space-x-4">
            <SearchDropdown
              options={[
                { label: "All", value: "" },
                { label: "Scheme Name", value: "vsSchemeName" },
                { label: "Scheme Code", value: "vsSchemeCode" },
                { label: "Scheme Type", value: "vsSchemeType" },
                { label: "Fund Name", value: "vsFundName" },
                { label: "Sanction Date (yyyy/mm/dd)", value: "dtSanctionDate" }
              ]}
              onSelect={handleDropdownSelect}
              selected={searchKey}
            />
            {searchKey && (
              <>
                <SearchInputBox
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={`Enter ${searchKeyLabel}`}
                />
                <button
                  className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-800"
                  onClick={() => {
                    setSearchValue("");
                    setSearchKey("");
                    setSearchKeyLabel("");
                    setFilteredData(fetchedData?.data?.data || []);
                  }}
                >
                  Clear
                </button>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <TemplateDownloadButton
              templateType={7}
              templateTitle="Batch Template"
              Icon={DownloadCloud}
            />

            <ModalOpenButton
              modalType={11}
              modalTitle="Bulk Upload"
              bulkName="batch"
              Icon={UploadCloud}

            />
            <ModalOpenButton
              modalType={4}
              modalTitle="Add Batch"
              bulkName="Batch"
              Icon={Add}

            />
          </div>
        </div>
      </div>

      <CentralizedTable columns={columns} data={filteredData} pageSize={5} />
    </>
  );
}

export default Batch


