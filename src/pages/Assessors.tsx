import React, { useEffect, useMemo, useState } from "react";
import CentralizedTable from "../components/CentralizedTable";
import { assessorsColumns } from "../utils/tableColumns";
import { assessorsDuplicateColumns } from "../utils/tableColumns";
import ModalOpenButton from "../components/ui/ModelOpenButton";
import SearchInputBox from "../components/ui/SearchInputBox";
import SearchDropdown from "../components/ui/SearchDropdown";
import {  DownloadCloud, UploadCloud } from "lucide-react";
import { Add } from "@mui/icons-material";
import TemplateDownloadButton from "../components/ui/TemplateDownloadButton";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTableData } from "../services/state/api/tableDataApi";
import useDebounce from "../services/state/useDebounce";
import Loader from "../components/ui/Loader";
import { Column } from "react-table";




const Assessors: React.FC = () => {

   const navigate = useNavigate();
  
    
  
   const columns = useMemo<Column<any>[]>(() => assessorsColumns(navigate) as Column<any>[], [navigate]);

   const duplicateColumns = useMemo<Column<any>[]>(() => assessorsDuplicateColumns(navigate) as Column<any>[], [navigate]);
   

 const [searchKey, setSearchKey] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchKeyLabel, setSearchKeyLabel] = useState<string>("");
  const [filteredData, setFilteredData] = useState([]);
    const [duplicateData, setDuplicateData] = useState([]);
      const [totalCount, setTotalCount] = useState(0);

  const debouncedSearchValue = useDebounce(searchValue, 1000);
  
  const {
    data: fetchedData,
    isLoading,
    isSuccess,
   
  } = useQuery({
    queryKey: ["assessorData", searchKey, debouncedSearchValue],
    queryFn: () => getTableData("assessor", searchKey, debouncedSearchValue),
   
  });

  useEffect(() => {
     if (isSuccess) {
       if (fetchedData?.data?.data && fetchedData.data.data.length > 0) {
         setFilteredData(fetchedData.data.data);
         setTotalCount(fetchedData.data.total_count);
       } else {
         setFilteredData([]);
       }
 
       if (fetchedData?.data?.duplicate_Assessors && fetchedData.data?.duplicate_Assessors.length > 0) {
         setDuplicateData(fetchedData.data?.duplicate_Assessors);
       } else {
         setDuplicateData([]);
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
        <p className="text-2xl font-bold mb-4">List Of Assessors</p>
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
              templateType={5}
              templateTitle="Assessors Template"
              Icon={DownloadCloud}
            />

            <ModalOpenButton
              modalType={11}
              modalTitle="Bulk Upload"
              bulkName="assessor"
              Icon={UploadCloud}
            
            />
            <ModalOpenButton
              modalType={7}
              modalTitle="Add Assessors"
              bulkName="assessor"
              Icon={Add}
            
            />
          </div>
        </div>
        <div className="py-2 text-lg text-green-600">Total Count: {totalCount}</div>
      </div>

       <CentralizedTable columns={columns} data={filteredData} pageSize={5} /> 
       <div className="bg-yellow-100 mt-8 text-red-700 text-sm  flex items-center justify-center p-4 rounded-sm w-full  mx-auto">
        <span className="text-red-500 text-2xl mr-2">⚠️</span>
        Duplicate records are checked using 'PAN NO' across multiple logins. These field is the minimum required to identify duplicates.
      </div>
       <div className="pt-10">
        <p className="text-2xl font-bold mb-4">Cross-Department Duplicate Assessors</p>
        <CentralizedTable columns={duplicateColumns} data={duplicateData} pageSize={5} />
      </div>
    </>
  );
};

export default Assessors;
