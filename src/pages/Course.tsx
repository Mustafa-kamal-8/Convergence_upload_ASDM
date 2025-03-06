
import React, { useEffect, useMemo, useState } from "react";
import CentralizedTable from "../components/CentralizedTable";
import ModalOpenButton from "../components/ui/ModelOpenButton";
import SearchInputBox from "../components/ui/SearchInputBox";
import { DownloadCloud, UploadCloud } from "lucide-react";
import { Add } from "@mui/icons-material";
import TemplateDownloadButton from "../components/ui/TemplateDownloadButton";
import { courseColumns } from "../utils/tableColumns";
import { getTableData } from "../services/state/api/tableDataApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import useDebounce from "../services/state/useDebounce";
import SearchDropdown from "../components/ui/SearchDropdown";
import Loader from "../components/ui/Loader";
import { courseDuplicateColumns } from "../utils/tableColumns";
import { Column } from "react-table";
const Course: React.FC = () => {


  const [searchValue, setSearchValue] = useState<string>("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState<string>("");
  const [searchKeyLabel, setSearchKeyLabel] = useState<string>("");
  const debouncedSearchValue = useDebounce(searchValue, 1000);
  const [duplicateData, setDuplicateData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
   const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(25);

   const columns = useMemo<Column<any>[]>(() => courseColumns(navigate) as Column<any>[], [navigate]);
    const duplicateColumns = useMemo<Column<any>[]>(() => courseDuplicateColumns(navigate) as Column<any>[], [navigate]);

  const { data: fetchedData, isSuccess, isLoading } = useQuery({
    queryKey: ["courseData", "course", searchKey, debouncedSearchValue ,currentPage, pageSize,],
    queryFn: () => getTableData("course", searchKey, debouncedSearchValue,currentPage, pageSize,),
  });

  useEffect(() => {
    if (isSuccess) {
      if (fetchedData?.data?.data && fetchedData.data.data.length > 0) {
        setFilteredData(fetchedData.data.data);
        setTotalCount(fetchedData.data.total_count);
      } else {
        setFilteredData([]);
      }

      if (fetchedData?.data?.duplicate_course && fetchedData.data?.duplicate_course.length > 0) {
        setDuplicateData(fetchedData.data?.duplicate_course);
      } else {
        setDuplicateData([]);
      }
    }
  }, [fetchedData, isSuccess]);

  console.log("duplicate data courses are", duplicateData)

  // Handle search logic
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
        <p className="text-2xl font-bold mb-4">List Of Course</p>
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
              templateType={2}
              templateTitle="Course Template"
              Icon={DownloadCloud}
            />

            <ModalOpenButton
              modalType={11}
              modalTitle="Bulk Upload"
              bulkName="course"
              Icon={UploadCloud}

            />
            <ModalOpenButton
              modalType={2}
              modalTitle="Add Course"
              bulkName="course"
              Icon={Add}

            />
          </div>
        </div>
        <div className="py-2 text-lg text-green-600">Total Count: {totalCount}</div>
      </div>

      <CentralizedTable 
      columns={columns} 
      data={filteredData}
      pageSize={pageSize}
        currentPage={currentPage}
        totalCount={totalCount}
         onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize} />
      <div className="bg-yellow-100 mt-8 text-red-700 text-sm  flex items-center justify-center p-4 rounded-sm w-full  mx-auto">
        <span className="text-red-500 text-2xl mr-2">⚠️</span>
        Duplicate records are checked using 'Course Name' and 'Course Code' across multiple logins. These fields are the minimum required to identify duplicates.
      </div>
      <div className="pt-10">
        <p className="text-2xl font-bold mb-4">Cross-Department Duplicate Courses</p>
        <CentralizedTable columns={duplicateColumns} data={duplicateData} pageSize={5} />
      </div>
    </>
  );
}

export default Course

