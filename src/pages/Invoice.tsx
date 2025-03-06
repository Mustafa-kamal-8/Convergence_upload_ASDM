import React, { useEffect, useMemo, useState } from "react";
 import ModalOpenButton from "../components/ui/ModelOpenButton";
import { AlertCircle, CheckCircle, DownloadCloud, UploadCloud, X,  } from "lucide-react";
import { Add } from "@mui/icons-material";
 import TemplateDownloadButton from "../components/ui/TemplateDownloadButton";
import Loader from "../components/ui/Loader";
import { getTableData } from "../services/state/api/tableDataApi";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "../services/state/useDebounce";
import { invoiceColumns } from "../utils/tableColumns";
import { useNavigate } from "react-router-dom";
import CentralizedTable from "../components/CentralizedTable";
import SearchDropdown from "../components/ui/SearchDropdown";
import SearchInputBox from "../components/ui/SearchInputBox";
import { Column } from "react-table";
import { useErrorStore } from "../services/useErrorStore";




 const Invoice: React.FC = () => {

  const navigate = useNavigate();

  

  const columns = useMemo<Column<any>[]>(() => invoiceColumns(navigate) as Column<any>[], [navigate]);


  const [searchKey, setSearchKey] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchKeyLabel, setSearchKeyLabel] = useState<string>("");
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount , setTotalCount] = useState([])
     const errorMessage = useErrorStore((state) => state.errorMessage);
                    const successMessage = useErrorStore((state) => state.successMessage);
                    const { bulkName } = useErrorStore();
                  
                    const clearErrorMessage = useErrorStore((state) => state.clearErrorMessage);
                    const clearSuccessMessage = useErrorStore(
                      (state) => state.clearSuccessMessage
                    );
                    const { statusColor } = useErrorStore();
          

  const debouncedSearchValue = useDebounce(searchValue, 1000);

  const {
    data: fetchedData,
    isLoading,
    isSuccess,
   
  } = useQuery({
    queryKey: ["invoicewData", searchKey, debouncedSearchValue],
    queryFn: () => getTableData("invoice", searchKey, debouncedSearchValue),
   
  });

  useEffect(() => {
    if (isSuccess) {
      if (fetchedData?.data?.data && fetchedData.data.data.length > 0) {
        setFilteredData(fetchedData.data.data);
        setTotalCount(fetchedData.data.total_count)
      } else {
        setFilteredData([]);
      }
    }
  }, [fetchedData, isSuccess]);

  const handleDropdownSelect = (option: { label: string; value: string }) => {
    setSearchKey(option.value);
    setSearchKeyLabel(option.label);
    setSearchValue(""); 
  };
  

  const handleSearch = (value: string) => {
    setSearchValue(value);
   
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
     
      <div className="">
        <p className="text-2xl font-bold mb-4">List Of Invoices</p>
        {bulkName === "invoice" && (
          <>
            {successMessage && (
              <div
                className={`m-2 text-sm flex items-center justify-between p-4 rounded-sm w-full mx-auto relative
      ${statusColor === "g" ? "bg-green-100 text-green-600" : ""}
      ${statusColor === "y" ? "bg-blue-100 text-blue-600" : ""}
      ${statusColor === "r" ? "bg-red-100 text-red-600" : ""}`}
              >
                <div className="flex items-center">
                  {statusColor === "g" && (
                    <CheckCircle className="w-5 h-5 text-green-700 mr-2" />
                  )}
                  {statusColor === "y" && (
                    <AlertCircle className="w-5 h-5 text-blue-900 mr-2" />
                  )}
                  {statusColor === "r" && (
                    <AlertCircle className="w-5 h-5 text-red-700 mr-2" />
                  )}

                  <p
                    style={{ color: statusColor }}
                    dangerouslySetInnerHTML={{
                      __html: successMessage
                        ? successMessage.replace(/\n/g, "<br />")
                        : successMessage,
                    }}
                  ></p>
                </div>
                <button
                  onClick={clearSuccessMessage}
                  className="absolute right-4 top-2"
                >
                  <X
                    className={`w-5 h-5 cursor-pointer 
          ${statusColor === "g" ? "text-green-700" : ""}
          ${statusColor === "y" ? "text-yellow-700" : ""}
          ${statusColor === "r" ? "text-red-700" : ""}`}
                  />
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-100  text-red-700 text-sm flex items-center justify-between p-4 rounded-sm w-full  relative">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-700 mr-2" />
                  <p
                    style={{ color: "red" }}
                    dangerouslySetInnerHTML={{
                      __html: errorMessage.replace(/\n/g, "<br />"),
                    }}
                  ></p>
                </div>
                <button
                  onClick={clearErrorMessage}
                  className="absolute right-4 top-2"
                >
                  <X className="w-5 h-5 text-red-700 cursor-pointer" />
                </button>
              </div>
            )}
          </>
        )}
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
              templateType={11}
              templateTitle="Invoice Template"
              Icon={DownloadCloud}
            />

            <ModalOpenButton
              modalType={11}
              modalTitle="Bulk Upload"
              bulkName="invoice"
              Icon={UploadCloud}
            
            />
            <ModalOpenButton
              modalType={10}
              modalTitle="Add Invoice"
              bulkName="Invoice"
              Icon={Add}
            
            />
          </div>
        </div>
        <div className="py-2 text-lg text-green-600">Total Count: {totalCount}</div>
      </div>

      <CentralizedTable columns={columns} data={filteredData} pageSize={5} />
    </>
  );
};

export default Invoice;
